import {Request, Response} from "express";
import {jwtService} from "../../application/jwt.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {errorHandler} from "../../../core/errors/error.handler";
import {ResultStatus} from "../../../core/result/result.code";

export async function logoutHandler(req: Request, res: Response) {
    try {
        const oldRefreshToken = req.cookies.refresh_token;
        if (!oldRefreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'No refresh token' }]
            });
        }
        const decodedPayload = await jwtService.verifyToken(oldRefreshToken);
        if (!decodedPayload) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const result = await authService.addTokenToBlackList(oldRefreshToken);
        clearRefreshTokenCookie(res);
        if (result.status === ResultStatus.Success) {
            return res.status(HttpStatus.Ok).json({
                message: 'Successfully logged out'
            });
        } else {
            // Токен добавлен в чёрный список, но была какая-то проблема
            return res.status(HttpStatus.Ok).json({
                message: 'Logged out (token may be expired)'
            });
        }
    } catch(e: unknown) {
        errorHandler(e, res);
    }
}
function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token'
    });
}