import {SessionOutput} from "../routes/output/session-output";
import { injectable } from 'inversify';
import {SessionDocument, SessionModel} from "../domain/session.entity";

@injectable()
export class SessionQueryRepository {
    async getSession(deviceId: string, userId: string): Promise<SessionDocument|null> {
        const session = await SessionModel.findOne({deviceId, userId});
        if (!session) {
            return null;
        }
        return session;
    }
    async getSessionsByUserId(userId: string): Promise<SessionDocument[]> {
        return SessionModel.find({userId});
    }
    async mapToSessionOutput(sessions: SessionDocument[]): Promise<SessionOutput[]|null> {
        if (!sessions || sessions.length===0) {
            return null;
        }
        return sessions.map((session: SessionDocument) => {
            return {
                ip: session.ipAddress,
                title: session.deviceName,
                lastActiveDate: session.iat.toISOString(),
                deviceId: session.deviceId,
            }
        })
    }
}
