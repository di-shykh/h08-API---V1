import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {jwtService} from "../../application/jwt.service";
import {errorHandler} from "../../../core/errors/error.handler";

export async function refreshTokenHandler (req: Request, res: Response) {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'No refresh token' }]
            });
        }
        const decodedPayload = await jwtService.verifyToken(oldRefreshToken);
        if (!decodedPayload|| !decodedPayload.userId) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const tokenResult = await jwtService.createToken(decodedPayload.userId);
        await authService.addTokenToBlackList(oldRefreshToken);
        res.cookie('refreshToken', tokenResult.refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === 'production', (HTTPS)
            sameSite: 'strict', // или 'lax' / 'none'
            maxAge: 20 * 1000, // х
            path: '/auth/refresh-token', // доступен для всех путей
        });

        return res.status(HttpStatus.Ok).json({
            accessToken: tokenResult.accessToken
        });
    } catch(e: unknown) {
            errorHandler(e, res);
    }
}