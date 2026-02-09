import {Session} from "../domain/session";
import {sessionCollection} from "../../db/mongo.bd";
import {DeleteResult, ObjectId, UpdateResult, WithId} from "mongodb";

export class sessionRepository {
    static async createSession(session: Session): Promise<string> {
        const insertResult = await sessionCollection.insertOne(session);
        return insertResult.insertedId.toString();
    }
    static async deleteSession(id: string): Promise<DeleteResult> {
        const deletedSession = await sessionCollection.deleteOne({_id: new ObjectId(id)});
        return deletedSession

    }
    static async updateSession(id: string, iat: Date): Promise<UpdateResult> {
        const updatedSession = await sessionCollection.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    iat: iat,
                },
            },
        );
        return updatedSession;
    }
    static async findByDeviceId(deviceId: string): Promise<WithId<Session>|null> {
        const session: WithId<Session>|null = await sessionCollection.findOne({deviceId});
        return session;
    }
    static async deleteSessionForDevice(deviceId: string): Promise<DeleteResult> {
        const deletedSession = await sessionCollection.deleteOne({deviceId});
        return deletedSession;
    }
    static async deleteSessionList(userId: string, deviceId: string): Promise<DeleteResult> {
        const deletedSessionList = await sessionCollection.deleteMany({
            userId: userId,
            deviceId: {$ne: deviceId},
        });
        return deletedSessionList;
    }
}