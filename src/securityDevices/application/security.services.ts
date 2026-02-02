import {Session} from "../domain/session";
import {jwtService} from "../../auth/application/jwt.service";
import {sessionRepository} from "../repositories/session.repository";
import {WithId} from "mongodb";

export const securityService = {
    async refreshToken(session: WithId<Session>): Promise<{accessToken: string, refreshToken: string}|null> {
       const tokenResult = await jwtService.createToken(session.userId, session.deviceId);
       const payload = await jwtService.verifyTokenFull(tokenResult.refreshToken);
       if (!payload) {
           return null;
       }
       const iat = payload.iat;
       await sessionRepository.updateSession(session, iat)
    }
}