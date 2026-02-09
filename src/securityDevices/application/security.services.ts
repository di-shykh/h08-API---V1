import {Session} from "../domain/session";
import {DeleteResult, UpdateResult, WithId} from "mongodb";
import {Result, ResultObject} from "../../core/result/result.type";
import {SessionRepository} from "../repositories/session.repository";
import {JwtService} from "../../auth/application/jwt.service";

export class SecurityService {
    jwtService: JwtService;
    sessionRepository: SessionRepository;

    constructor(jwtService: JwtService,sessionRepository: SessionRepository) {
        this.jwtService = jwtService;
        this.sessionRepository = sessionRepository;
    }

    async refreshToken(session: WithId<Session>): Promise<Result<{
        accessToken: string;
        refreshToken: string;
    } | null>> {
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
       const result: UpdateResult = await this.sessionRepository.updateSession(session._id.toString(), iat);
       if(result.matchedCount<1) {
           return ResultObject.Unauthorized();
       }
       return ResultObject.Success(tokenResult);
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
        if(session.userId!==userId) {
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
