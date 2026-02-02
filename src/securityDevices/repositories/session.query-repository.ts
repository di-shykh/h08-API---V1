import {sessionCollection} from "../../db/mongo.bd";
import {Session} from "../domain/session";
import {WithId} from "mongodb";

export const sessionQueryRepository = {
    async getSession(deviceId: string, userId: string): Promise<WithId<Session>|null> {
        const session = await sessionCollection.findOne({deviceId, userId});
        if (!session) {
            return null;
        }
        return session;
    }
}