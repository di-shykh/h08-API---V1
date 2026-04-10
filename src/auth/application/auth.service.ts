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
import {PasswordRecoveryDocument} from "../domain/password-recovery.entity";
import {UserDocument} from "../../users/domain/user.entity";
import {SessionModel} from "../../securityDevices/domain/session.entity";

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

        const {accessToken, refreshToken} = await this.jwtService.createToken(user._id.toString(), deviceId);
        const payload = await this.jwtService.verifyTokenFull(refreshToken);

        const iat = payload!.iat || Math.floor(Date.now() / 1000);
        const session: Session = {
            userId,
            deviceId,
            deviceName,
            ipAddress,
            iat: new Date(iat*1000),
            exp: new Date(Date.now()+20000),
        };
        const newSession = new SessionModel(session);
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
        const expirationDate: string = addHours(new Date(), 24).toISOString();

        const newUser: UserDB = {
            login,
            email: normalizedEmail,
            passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: confirmationCode,
                expirationDate: expirationDate,
            }
        }
        const newUserId = await this.usersRepository.createUser(newUser);
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
        if(!user||!user.emailConfirmation) {
            return ResultObject.BadRequest('code', 'Code does not exist');
        }
        if(user.emailConfirmation.isConfirmed) {
            return ResultObject.BadRequest('code', 'Registration is already confirmed');
        }
        const dateNow = new Date();
        const expirationDate = new Date(user.emailConfirmation.expirationDate);
        if(isAfter(dateNow,expirationDate)){
            return ResultObject.BadRequest('code', 'Code expired');
        }
        user.emailConfirmation.isConfirmed = true;
        user.emailConfirmation.confirmationCode = '';
        try {
            await this.usersRepository.save(user);
        } catch(err){
            return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
        }
        return ResultObject.Success(true);
    }
    async resendEmail(email: string): Promise<Result<boolean|null>> {
        const user: UserDocument|null = await this.usersRepository.findUserByEmail(email);
        if(!user||!user.emailConfirmation) {
            return ResultObject.BadRequest('email', 'User with this email is not exists');
        }
        if(user.emailConfirmation?.isConfirmed){
            return ResultObject.BadRequest('email', 'Email is already confirmed');
        }
        const confirmationCode: string = uuidv4();
        const expirationDate: string = addHours(new Date(), 24).toISOString();

        try{
            await this.emailAdapter.resendEmail(email,confirmationCode);
            user.emailConfirmation.confirmationCode= confirmationCode;
            user.emailConfirmation.expirationDate = expirationDate;
            await this.usersRepository.save(user);
            return ResultObject.Success(true);
        } catch (e) {
            return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
        }
    }
    async passwordRecovery(email: string): Promise<Result<boolean|null>> {
        const normalizedEmail = normalizeEmail(email);
        const user = await this.usersRepository.findUserByEmail(normalizedEmail);
        if(!user) {
            return ResultObject.NoContent();
        }
        const recoveryCode: string = uuidv4();
        const expirationDate: Date = addHours(new Date(), 24);
        const passportRecoveryData: PasswordRecovery = {
            userId: user._id.toString(),
            isUsed: false,
            passwordRecoveryCode: recoveryCode,
            passwordRecoveryExpiration: expirationDate,
        }
        const recoveryResult = await this.passwordRecoveryRepository.addPasswordRecoveryData(user._id.toString(), passportRecoveryData);
        if(!recoveryResult){
            return ResultObject.BadRequest('email', 'Failed to save recovery code');
        }
        try {
            const result = await this.emailAdapter.sendRecoveryCodeOnEmail(normalizedEmail, recoveryCode);
        }catch(err){
            console.error('Failed to send recovery email:', err);
            return ResultObject.BadRequest('email', 'recovered code was not send');
        }
        return ResultObject.NoContent();
    }
    async newPassword(newPassword: string, recoveryCode: string): Promise<Result<boolean|null>> {
        const recoveryResult = await this.passwordRecoveryRepository.findCode(recoveryCode);
        if(!recoveryResult||recoveryResult.isUsed){
            return ResultObject.BadRequest('recoveryCode', 'Recovery code is not valid');
        }
        if(isAfter(new Date(),recoveryResult.passwordRecoveryExpiration)){
            return ResultObject.BadRequest('recoveryCode', 'Recovery code expired');
        }
        const newPasswordHash: string = await this.bcryptService.generateHash(newPassword);
        const result  = await this.usersRepository.saveNewPassword(recoveryResult.userId,newPasswordHash);
        if(!result){
            return ResultObject.BadRequest('recoveryCode', 'User with this recovery code is not exist');
        }
        recoveryResult.isUsed = true;
        await this.passwordRecoveryRepository.save(recoveryResult);
        return ResultObject.NoContent();
    }
}
