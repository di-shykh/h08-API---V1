import {Session} from "../domain/session";
import {sessionCollection} from "../../db/mongo.bd";
import {WithId} from "mongodb";

export const sessionRepository = {
    async createSession(session: WithId<Session>,iat: Date): Promise<string> {
        const insertResult = await sessionCollection.insertOne(session);
        return insertResult.insertedId.toString();
    },
    async deleteSession(session: Session): Promise<string> {},
    async updateSession(session: Session): Promise<void> {
        await sessionCollection.updateOne(
            {
                _id: session._id
            },
            {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            },

        )
    }
}