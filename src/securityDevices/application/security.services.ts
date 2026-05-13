import {DeleteResult} from "mongodb";
import {Result, ResultObject} from "../../core/result/result.type";
import {SessionRepository} from "../repositories/session.repository";
import {JwtService} from "../../auth/application/jwt.service";
import { inject, injectable } from 'inversify';
import { SessionEntity} from "../domain/session.entity";

@injectable()
export class SecurityService {
    jwtService: JwtService;
    sessionRepository: SessionRepository;

    constructor(
        @inject(JwtService) jwtService: JwtService,
        @inject(SessionRepository) sessionRepository: SessionRepository
    ) {
        this.jwtService = jwtService;
        this.sessionRepository = sessionRepository;
    }

    async refreshToken(session: SessionEntity): Promise<Result<{
        accessToken: string;
        refreshToken: string;
    } | null>> {
        if (session.isExpired()) {
            return ResultObject.Unauthorized();
        }
       const tokenResult = await this.jwtService.createToken(session.userId, session.deviceId);
       const payload = await this.jwtService.verifyTokenFull(tokenResult.refreshToken);
       if (!payload) {
           return ResultObject.Unauthorized();
       }
       if(!payload.iat) {
           return ResultObject.Unauthorized();
       }
       const iat = new Date(payload.iat * 1000);
       if (!iat) {
           return ResultObject.Unauthorized();
       }
       session.updateIat(iat);
        try{
            await this.sessionRepository.save(session);
            return ResultObject.Success(tokenResult);
        } catch(err) {
            console.log('Failed to update session:', err);
            return ResultObject.Unauthorized();
        }
    }
    async deleteSession(id: string): Promise<Result> {
       const result: DeleteResult = await this.sessionRepository.deleteSession(id);
       if (result.deletedCount<1) {
           return ResultObject.Unauthorized();
       }
       return ResultObject.NoContent();
    }
    async deleteSessionByDeviceId(deviceId: string, userId:string): Promise<Result> {
        const session = await this.sessionRepository.findByDeviceId(deviceId);
        if (!session) {
            return ResultObject.NotFound("deviceId", "Session for this device does not exist");
        }
        if(!session.belongsToUser(userId)) {
            return ResultObject.Forbidden();
        }
        const result: DeleteResult = await this.sessionRepository.deleteSessionForDevice(session.deviceId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound("deviceId", "Session for this device does not exist");
        }
        return ResultObject.NoContent();
    }
    async deleteSessionList(userId:string, deviceId: string): Promise<Result> {
        const result = await this.sessionRepository.deleteSessionList(userId, deviceId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound("userId", "Session for this user does not exist");
        }
        return ResultObject.NoContent();
    }
}
