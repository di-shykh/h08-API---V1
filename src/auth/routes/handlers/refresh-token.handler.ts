import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {jwtService} from "../../application/jwt.service";
import {errorHandler} from "../../../core/errors/error.handler";
import {sessionQueryRepository} from "../../../securityDevices/repositories/session.query-repository";
import {securityService} from "../../../securityDevices/application/security.services";

export async function refreshTokenHandler (req: Request, res: Response) {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'No refresh token' }]
            });
        }
        const decodedPayload = await jwtService.verifyTokenFull(oldRefreshToken);
        if (!decodedPayload|| !decodedPayload.userId) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'Refresh token is not valid' }]
            });
        }
        const iat= decodedPayload.iat;
        const deviceId = decodedPayload.deviceId;
        if(!deviceId||!iat){
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'Refresh token is not valid' }]
            });
        }
        const session = await sessionQueryRepository.getSession(deviceId, decodedPayload.userId);
        if (!session) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'Refresh token is not valid' }]
            });
        }
        const tokenResult = await securityService.refreshToken(session);
        if(!tokenResult){
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'Refresh token is not valid' }]
            });
        }
        if (!tokenResult.data) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'Refresh token is not valid' }]
            });
        }
        const { accessToken, refreshToken } = tokenResult.data;
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === 'production', (HTTPS)
            sameSite: 'strict', // или 'lax' / 'none'
            maxAge: 20 * 1000, // х
            path: '/auth/refresh-token', // доступен для всех путей
        });

        return res.status(HttpStatus.Ok).json({
            accessToken: accessToken
        });
    } catch(e: unknown) {
            errorHandler(e, res);
    }
}