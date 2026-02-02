import {Session} from "../domain/session";
import {jwtService} from "../../auth/application/jwt.service";
import {sessionRepository} from "../repositories/session.repository";
import {UpdateResult, WithId} from "mongodb";
import {ResultStatus} from "../../core/result/result.code";
import {Result, ResultObject} from "../../core/result/result.type";

export const securityService = {
    async refreshToken(session: WithId<Session>): Promise<Result> {
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
       return ResultObject.Success(tokenResult);//todo и разобраться что будет в хэндлерах  jjj
    },
    async deleteSession(id: string): Promise<void> {
        await sessionRepository.deleteSession(id);
    }
}