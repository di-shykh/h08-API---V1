import {Session} from "../domain/session";
import {sessionCollection} from "../../db/mongo.bd";

export const sessionRepository = {
    async createSession(session: Session): Promise<string> {
        const insertResult = await sessionCollection.insertOne(session);
        return insertResult.insertedId.toString();
    },
}