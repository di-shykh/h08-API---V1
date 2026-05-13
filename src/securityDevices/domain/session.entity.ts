import {Session} from "./session";
import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {v4 as uuidv4} from "uuid";
import { ObjectId } from "mongodb";

interface SessionMethods {
    isExpired(): boolean;
    updateIat(iat: Date): void;
    belongsToUser(userId: string): boolean
}
type SessionStatics = typeof SessionEntity;
type SessionModelType = Model<Session, {}, SessionMethods> & SessionStatics;
export type SessionDocument = HydratedDocument<Session, SessionMethods>;

const sessionSchema = new mongoose.Schema<Session>({
    _id: {type: ObjectId, required: true},
    userId: {type: String, required: true},
    deviceId: {type: String, required: true},
    deviceName: {type: String, required: true},
    ipAddress: {type: String, required: true},
    iat: {type:Date, required: true},
    exp: {type: Date, required: true},
});
sessionSchema.index(
    { exp: 1 },
    { expireAfterSeconds: 0, name: 'exp_ttl_index' }
);
export class SessionEntity{
    private constructor(
        public _id: ObjectId,
        public userId: string,
        public deviceId: string,
        public deviceName: string,
        public ipAddress: string,
        public iat: Date,
        public exp: Date,
    ) {}
    static create(userId: string, deviceName: string, ipAddress: string, iat: number, deviceId: string): SessionEntity {
        const newIat = new Date(iat*1000);
        const exp= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        return new SessionEntity(
            new ObjectId(),
            userId,
            deviceId,
            deviceName,
            ipAddress,
            newIat,
            exp,
        );
    }
    static restore(
        _id: string|ObjectId,
        userId: string,
        deviceId: string,
        deviceName: string,
        ipAddress: string,
        iat: Date,
        exp: Date,
    ): SessionEntity {
        const objectId = typeof _id === 'string' ? new ObjectId(_id) : _id;
        return new SessionEntity(
            objectId,
            userId,
            deviceId,
            deviceName,
            ipAddress,
            iat,
            exp
        );
    }
    isExpired(): boolean {
        if (!this.exp) return true
        return new Date() > this.exp
    }
    updateIat(iat: Date): void {
        if(this.isExpired()){
            throw new Error('Cannot update expired session');
        }
        this.iat = iat;
    }
    belongsToUser(userId: string): boolean {
        return userId === this.userId;
    }
}
sessionSchema.loadClass(SessionEntity);
export const SessionModel = model<Session, SessionModelType>('session', sessionSchema);