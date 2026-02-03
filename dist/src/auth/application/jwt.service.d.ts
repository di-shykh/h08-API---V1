import { JwtPayload } from 'jsonwebtoken';
export declare const jwtService: {
    createToken(userId: string, deviceId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    decodeToken(token: string): Promise<any>;
    verifyToken(token: string): Promise<{
        userId: string;
    } | null>;
    verifyTokenFull(token: string): Promise<(JwtPayload & {
        userId: string;
    }) | null>;
};
//# sourceMappingURL=jwt.service.d.ts.map