export type Session = {
    userId: string;
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    iat: Date;
    exp: Date;
}