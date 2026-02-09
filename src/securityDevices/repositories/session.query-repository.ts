import {sessionCollection} from "../../db/mongo.bd";
import {Session} from "../domain/session";
import {WithId} from "mongodb";
import {SessionOutput} from "../routes/output/session-output";

export class sessionQueryRepository {
    static async getSession(deviceId: string, userId: string): Promise<WithId<Session>|null> {
        const session = await sessionCollection.findOne({deviceId, userId});
        if (!session) {
            return null;
        }
        return session;
    }
    static async getSessionsByUserId(userId: string): Promise<WithId<Session>[]|null> {
        return await sessionCollection.find({userId}).toArray();
    }
    static async mapToSessionOutput(sessions: WithId<Session>[]): Promise<SessionOutput[]|null> {
        if (!sessions || sessions.length===0) {
            return null;
        }
        return sessions.map((session: WithId<Session>) => {
            return {
                ip: session.ipAddress,
                title: session.deviceName,
                lastActiveDate: session.iat.toISOString(),
                deviceId: session.deviceId,
            }
        })
    }
}