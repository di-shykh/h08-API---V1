import {Session} from "../domain/session";
import {jwtService} from "../../auth/application/jwt.service";
import {sessionRepository} from "../repositories/session.repository";
import {DeleteResult, UpdateResult, WithId} from "mongodb";
import {ResultStatus} from "../../core/result/result.code";
import {Result, ResultObject} from "../../core/result/result.type";

export class securityService {
    static async refreshToken(session: WithId<Session>): Promise<Result<{
        accessToken: string;
        refreshToken: string;
    } | null>> {
       const tokenResult = await jwtService.createToken(session.userId, session.deviceId);
       const payload = await jwtService.verifyTokenFull(tokenResult.refreshToken);
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
       const result: UpdateResult = await sessionRepository.updateSession(session._id.toString(), iat);
       if(result.matchedCount<1) {
           return ResultObject.Unauthorized();
       }
       return ResultObject.Success(tokenResult);
    }
    static async deleteSession(id: string): Promise<Result> {
       const result: DeleteResult = await sessionRepository.deleteSession(id);
       if (result.deletedCount<1) {
           return ResultObject.Unauthorized();
       }
       return ResultObject.NoContent();
    }
    static async deleteSessionByDeviceId(deviceId: string, userId:string): Promise<Result> {
        const session = await sessionRepository.findByDeviceId(deviceId);
        if (!session) {
            return ResultObject.NotFound("deviceId", "Session for this device does not exist");
        }
        if(session.userId!==userId) {
            return ResultObject.Forbidden();
        }
        const result: DeleteResult = await sessionRepository.deleteSessionForDevice(session.deviceId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound("deviceId", "Session for this device does not exist");
        }
        return ResultObject.NoContent();
    }
    static async deleteSessionList(userId:string, deviceId: string): Promise<Result> {
        const result = await sessionRepository.deleteSessionList(userId, deviceId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound("userId", "Session for this user does not exist");
        }
        return ResultObject.NoContent();
    }
}