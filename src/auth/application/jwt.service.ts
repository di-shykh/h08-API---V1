import jwt, {JwtPayload} from 'jsonwebtoken';

export const jwtService ={
    async   createToken (userId: string, deviceId:string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const secret: string = process.env.JWT_SECRET as string;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const accessToken: string = jwt.sign({ userId, type: 'access', iat: Date.now()  }, secret, { expiresIn: '10s' });
        const refreshToken: string = jwt.sign({ userId, deviceId, type: 'refresh', iat: Date.now()  }, secret, { expiresIn: '20s' });
        return { accessToken, refreshToken };
    },
    async decodeToken(token: string): Promise<any> {
        try{
            return jwt.decode(token);
        } catch (e) {
            console.error("Can't decode token",e);
            return null;
        }
    },
    async verifyToken(token: string): Promise<{ userId: string }|null> {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        } catch (e) {
            console.error("Can't verify token",e);
            return null;
        }
    },
    async verifyTokenFull(token: string): Promise<JwtPayload & { userId: string } | null> {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { userId: string };
        } catch (e) {
            console.error("Can't verify token", e);
            return null;
        }
    }
}

