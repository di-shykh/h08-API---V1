import {Session} from "../domain/session";
import {sessionCollection} from "../../db/mongo.bd";
import {DeleteResult, ObjectId, UpdateResult, WithId} from "mongodb";
import { injectable } from 'inversify';

@injectable()
export class SessionRepository {
    async createSession(session: Session): Promise<string> {
        const insertResult = await sessionCollection.insertOne(session);
        return insertResult.insertedId.toString();
    }
    async deleteSession(id: string): Promise<DeleteResult> {
        const deletedSession = await sessionCollection.deleteOne({_id: new ObjectId(id)});
        return deletedSession

    }
    async updateSession(id: string, iat: Date): Promise<UpdateResult> {
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
    async findByDeviceId(deviceId: string): Promise<WithId<Session>|null> {
        const session: WithId<Session>|null = await sessionCollection.findOne({deviceId});
        return session;
    }
    async deleteSessionForDevice(deviceId: string): Promise<DeleteResult> {
        const deletedSession = await sessionCollection.deleteOne({deviceId});
        return deletedSession;
    }
    async deleteSessionList(userId: string, deviceId: string): Promise<DeleteResult> {
        const deletedSessionList = await sessionCollection.deleteMany({
            userId: userId,
            deviceId: {$ne: deviceId},
        });
        return deletedSessionList;
    }
}
