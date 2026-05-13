import { SessionEntity } from '../domain/session.entity';
import {DeleteResult, ObjectId} from "mongodb";
import { injectable } from 'inversify';
import {SessionDocument, SessionModel} from "../domain/session.entity";
import mongoose from "mongoose";

@injectable()
export class SessionRepository {
    async save(session: SessionEntity): Promise<void> {
        await SessionModel.findOneAndUpdate(
            {_id:session._id},
            {
                userId: session.userId,
                deviceId: session.deviceId,
                deviceName: session.deviceName,
                ipAddress: session.ipAddress,
                iat: session.iat,
                exp: session.exp,
            },
            {upsert: true}
        )
    }
    async deleteSession(id: string): Promise<DeleteResult> {
        const deletedSession = await SessionModel.deleteOne({_id: id});
        return deletedSession

    }
    async findByDeviceId(deviceId: string): Promise<SessionEntity|null> {
        const result: SessionDocument|null = await SessionModel.findOne({deviceId});
        if(!result) return null;
        return SessionEntity.restore(
            result._id.toString(),
            result.userId,
            result.deviceId,
            result.deviceName,
            result.ipAddress,
            result.iat,
            result.exp
        )
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
    async findById(id: string): Promise<SessionEntity | null> {
        const result = await SessionModel.findById(id);
        if(!result) return null;
        return SessionEntity.restore(
            result._id.toString(),
            result.userId,
            result.deviceId,
            result.deviceName,
            result.ipAddress,
            result.iat,
            result.exp
        )
    }
}
