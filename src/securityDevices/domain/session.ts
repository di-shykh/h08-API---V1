import { ObjectId } from "mongodb";

export type Session = {
    _id: ObjectId;
    userId: string;
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    iat: Date;
    exp: Date;
}