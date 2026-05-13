import {WithId} from "mongodb";
import {UserDB} from "../../users/routes/output/user.db";
import { v4 as uuidv4 } from 'uuid';
import { addHours, isAfter } from 'date-fns';
import {UserCreateInput} from "../../users/routes/input/create-user.input";
import {Result, ResultObject} from "../../core/result/result.type";
import {normalizeEmail} from "../../core/helpers/normolize-email";
import {Session} from "../../securityDevices/domain/session";
import {EmailAdapter} from "../adapters/email.adapter";
import {BcryptService} from "../adapters/bcrypt.service";
import {JwtService} from "./jwt.service";
import {SessionRepository} from "../../securityDevices/repositories/session.repository";
import {UsersRepository} from "../../users/repositories/user.repository";
import {PasswordRecoveryRepository} from "../repositories/password-recovery.repository";
import { inject, injectable } from 'inversify';
import {PasswordRecovery} from "../types/password-recovery";
import {UserDocument, UserModel} from "../../users/domain/user.entity";
import {SessionEntity, SessionModel} from "../../securityDevices/domain/session.entity";
import {ResultStatus} from "../../core/result/result.code";
import {PasswordRecoveryModel} from "../domain/password-recovery.entity";

@injectable()
export class AuthService {
    bcryptService: BcryptService;
    jwtService: JwtService;
    emailAdapter: EmailAdapter;
    sessionRepository: SessionRepository;
    usersRepository: UsersRepository;
    passwordRecoveryRepository: PasswordRecoveryRepository;
    constructor(
        @inject(BcryptService) bcryptService: BcryptService,
        @inject(JwtService) jwtService: JwtService,
        @inject(EmailAdapter) emailAdapter: EmailAdapter,
        @inject(SessionRepository) sessionRepository: SessionRepository,
        @inject(UsersRepository) usersRepository: UsersRepository,
        @inject(PasswordRecoveryRepository) passwordRecoveryRepository: PasswordRecoveryRepository
    ) {
        this.bcryptService = bcryptService;
        this.jwtService = jwtService;
        this.emailAdapter = emailAdapter;
        this.sessionRepository = sessionRepository;
        this.usersRepository = usersRepository;
        this.passwordRecoveryRepository = passwordRecoveryRepository;
    }

    async loginUser(loginOrEmail: string, password: string, deviceName: string, ipAddress: string): Promise<{accessToken: string, refreshToken: string}|null> {
        const user: UserDocument|null = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return null;
        const result = await this.bcryptService.checkPassword(password, user.passwordHash);
        if (!result) return null;
        const deviceId: string = uuidv4();
        const userId = user._id.toString();

        const {accessToken, refreshToken} = await this.jwtService.createToken(userId, deviceId);
        const payload = await this.jwtService.verifyTokenFull(refreshToken);
        if (!payload) {
            console.log('Failed to verify refresh token');
            return null;
        }

        const iat = payload!.iat || Math.floor(Date.now() / 1000);

        const newSession = SessionEntity.create(userId, deviceName, ipAddress, iat, deviceId);
        try {
            await this.sessionRepository.save(newSession);
            return {accessToken, refreshToken};
        } catch (error) {
            console.log('Failed to create session: ',error);
            return null;
        }
    }
    async createUser(userInputDto: UserCreateInput): Promise<Result<string|null>> {

        const {login, email, password} = userInputDto;
        const normalizedEmail = normalizeEmail(email);
        const isLoginUnique = await this.usersRepository.isLoginUnique(login);
        if (!isLoginUnique) {
          return   ResultObject.BadRequest('login', 'Login already exists');
        }

        const isEmailUnique = await this.usersRepository.isEmailUnique(normalizedEmail);
        if (!isEmailUnique) {
           return  ResultObject.BadRequest('email', 'Email already exists');
        }
        const passwordHash: string = await this.bcryptService.generateHash(password);
        const confirmationCode: string = uuidv4();
        const newUser = UserModel.createUserWithConfirmationInfo(userInputDto, passwordHash, confirmationCode);
        const newUserId = await this.usersRepository.saveAndReturnId(newUser);
        try{
            await this.emailAdapter.sendConfirmationEmail(email, confirmationCode);
            return ResultObject.Success(newUserId);
        } catch(err){
               await this.usersRepository.deleteUser(newUserId);
               return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
            }
    }
    async confirmUserRegistration(code: string): Promise<Result<boolean|null>> {
        if (!code || code.length !== 36) { // UUID v4 имеет 36 символов
            return ResultObject.BadRequest('code', 'Invalid confirmation code format');
        }
        const user: UserDocument|null = await this.usersRepository.findByConfirmationCode(code);
        if(!user) {
            return ResultObject.BadRequest('code', 'Code does not exist');
        }
        try{
            user.confirmEmail(code);
        } catch(err){
            const message: string = err instanceof Error ? err.message : 'Confirmation failed';
            return ResultObject.BadRequest('code', message);
        }
        try {
            await this.usersRepository.save(user);
        } catch(err){
            return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
        }
        return ResultObject.Success(true);
    }
    async resendEmail(email: string): Promise<Result<boolean|null>> {
        const user: UserDocument|null = await this.usersRepository.findUserByEmail(email);
        if(!user) {
            return ResultObject.BadRequest('email', 'User with this email is not exists');
        }
        if(user.emailConfirmation?.isConfirmed){
            return ResultObject.BadRequest('email', 'Email is already confirmed');
        }
        const confirmationCode: string = uuidv4();
        try{
            await this.emailAdapter.resendEmail(email,confirmationCode);
            user.updateEmailConfirmationData(confirmationCode);
            await this.usersRepository.save(user);
            return ResultObject.Success(true);
        } catch (e) {
            const message: string = e instanceof Error ? e.message : 'Email wasn\'t confirmed';
            return ResultObject.BadRequest('email', message);
        }
    }
    async passwordRecovery(email: string): Promise<Result<boolean|null>> {
        const normalizedEmail = normalizeEmail(email);
        const user = await this.usersRepository.findUserByEmail(normalizedEmail);
        if(!user) {
            return ResultObject.NoContent();
        }
        const passwordRecovery = PasswordRecoveryModel.createPasswordRecovery(user._id.toString());
        const recoveryResult = await this.passwordRecoveryRepository.save(passwordRecovery);
        if(!recoveryResult){
            return ResultObject.BadRequest('email', 'Failed to save recovery code');
        }
        try {
            const result = await this.emailAdapter.sendRecoveryCodeOnEmail(normalizedEmail, passwordRecovery.passwordRecoveryCode);
        }catch(err){
            console.error('Failed to send recovery email:', err);
            return ResultObject.BadRequest('email', 'recovered code was not send');
        }
        return ResultObject.NoContent();
    }
    async newPassword(newPassword: string, recoveryCode: string): Promise<Result<boolean|null>> {
        const recoveryResult = await this.passwordRecoveryRepository.findByCode(recoveryCode);
        if(!recoveryResult){
            return ResultObject.BadRequest('recoveryCode', 'Recovery code is not valid');
        }
        if(!recoveryResult.isValid(recoveryCode)){
            return ResultObject.BadRequest('recoveryCode', 'Recovery code is not valid');
        }
        const newPasswordHash: string = await this.bcryptService.generateHash(newPassword);
        const result  = await this.usersRepository.saveNewPassword(recoveryResult.userId,newPasswordHash);
        if(!result){
            return ResultObject.BadRequest('recoveryCode', 'User with this recovery code is not exist');
        }
        recoveryResult.use(recoveryCode);
        await this.passwordRecoveryRepository.save(recoveryResult);
        return ResultObject.NoContent();
    }
}
