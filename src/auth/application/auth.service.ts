import {usersRepository} from "../../users/repositories/user.repository";
import {bcryptService} from "../adapters/bcrypt.service";
import {jwtService} from "./jwt.service";
import {WithId} from "mongodb";
import {UserDB} from "../../users/routes/output/user.db";
import { v4 as uuidv4 } from 'uuid';
import { addHours, isAfter } from 'date-fns';
import {usersQueryRepository} from "../../users/repositories/user.query-repository";
import {UserCreateInput} from "../../users/routes/input/create-user.input";
import {emailAdapter} from "../adapters/email.adapter";
import {Result, ResultObject} from "../../core/result/result.type";
import {normalizeEmail} from "../../core/helpers/normolize-email";
import {Session} from "../../securityDevices/domain/session";
import {sessionRepository} from "../../securityDevices/repositories/session.repository";

export const authService = {
    async loginUser(loginOrEmail: string, password: string, deviceName: string, ipAddress: string): Promise<{accessToken: string, refreshToken: string}|null> {
        const user: WithId<UserDB>|null = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return null;
        const result = await bcryptService.checkPassword(password, user.passwordHash);
        if (!result) return null;
        const deviceId: string = uuidv4();
        const userId = user._id.toString();

        const {accessToken, refreshToken} = await jwtService.createToken(user._id.toString(), deviceId);
        const payload = jwtService.verifyTokenFull(refreshToken);
        if (!payload){
            return null;
        }
        if (!(payload as any).iat) {
            return null;
        }
        const iat = (payload as any).iat || Math.floor(Date.now() / 1000);
        const session: Session = {
            userId,
            deviceId,
            deviceName,
            ipAddress,
            iat: new Date(iat*1000),
            exp: new Date(Date.now()+20000),
        };
        const sessionId = await sessionRepository.createSession(session);
        if (!sessionId) return null;
        return {accessToken, refreshToken};
    },
    async createUser(userInputDto: UserCreateInput): Promise<Result<string|null>> {

        const {login, email, password} = userInputDto;
        const normalizedEmail = normalizeEmail(email);
        const isLoginUnique = await usersQueryRepository.isLoginUnique(login);
        if (!isLoginUnique) {
          return   ResultObject.BadRequest('login', 'Login already exists');
        }

        const isEmailUnique = await usersQueryRepository.isEmailUnique(normalizedEmail);
        if (!isEmailUnique) {
           return  ResultObject.BadRequest('email', 'Email already exists');
        }
        const passwordHash: string = await bcryptService.generateHash(password);
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
        const newUserId = await usersRepository.createUser(newUser);
        try{
            await emailAdapter.sendConfirmationEmail(email, confirmationCode);
            return ResultObject.Success(newUserId);
        } catch(err){
               await usersRepository.deleteUser(newUserId);
               return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
            }
    },
    async confirmUserRegistration(code: string): Promise<Result<boolean|null>> {
        if (!code || code.length !== 36) { // UUID v4 имеет 36 символов
            return ResultObject.BadRequest('code', 'Invalid confirmation code format');
        }
        const user: WithId<UserDB>|null = await usersQueryRepository.findByConfirmationCode(code);
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
        const result = await usersRepository.confirmEmail(code);
        if(!result){
            return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
        }
        return ResultObject.Success(result);
    },
    async resendEmail(email: string): Promise<Result<boolean|null>> {
        const user: WithId<UserDB>|null = await usersQueryRepository.findUserByEmail(email);
        if(!user||!user.emailConfirmation) {
            return ResultObject.BadRequest('email', 'User with this email is not exists');
        }
        if(user.emailConfirmation?.isConfirmed){
            return ResultObject.BadRequest('email', 'Email is already confirmed');
        }
        const confirmationCode: string = uuidv4();
        const expirationDate: string = addHours(new Date(), 24).toISOString();

        try{
            await emailAdapter.resendEmail(email,confirmationCode);
           const result = await usersRepository.updateUserEmailConfirmation(user._id, confirmationCode, expirationDate);
            return ResultObject.Success(result);
        } catch (e) {
            return ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
        }
    },
}