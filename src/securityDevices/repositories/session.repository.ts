import {Session} from "../domain/session";
import {DeleteResult, UpdateResult} from "mongodb";
import { injectable } from 'inversify';
import {SessionDocument, SessionModel} from "../domain/session.entity";

@injectable()
export class SessionRepository {
    async save(session: SessionDocument): Promise<void> {
        await session.save();
    }
    async deleteSession(id: string): Promise<DeleteResult> {
        const deletedSession = await SessionModel.deleteOne({_id: id});
        return deletedSession

    }
    async findByDeviceId(deviceId: string): Promise<SessionDocument|null> {
        const session: SessionDocument|null = await SessionModel.findOne({deviceId});
        return session;
    }
    async deleteSessionForDevice(deviceId: string): Promise<DeleteResult> {
        const deletedSession = await SessionModel.deleteOne({deviceId});
        return deletedSession;
    }
    async deleteSessionList(userId: string, deviceId: string): Promise<DeleteResult> {
        const deletedSessionList = await SessionModel.deleteMany({
            userId: userId,
            deviceId: {$ne: deviceId},
        });
        return deletedSessionList;
    }
}
