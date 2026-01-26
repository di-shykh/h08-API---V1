export type TokenBlacklistDB = {
    //sessionId: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}