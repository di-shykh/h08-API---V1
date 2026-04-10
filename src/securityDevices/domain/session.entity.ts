import {Session} from "./session";
import mongoose, {HydratedDocument, Model, model} from "mongoose";

type SessionModelType = Model<Session>;
export type SessionDocument = HydratedDocument<Session>;

const sessionSchema = new mongoose.Schema<Session>({
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
export const SessionModel = model<Session, SessionModelType>('session', sessionSchema);