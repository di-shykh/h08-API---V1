import {Request, Response} from "express";
import {jwtService} from "../../application/jwt.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorHandler} from "../../../core/errors/error.handler";
import {ResultStatus} from "../../../core/result/result.code";
import {securityService} from "../../../securityDevices/application/security.services";
import {sessionQueryRepository} from "../../../securityDevices/repositories/session.query-repository";

export async function logoutHandler(req: Request, res: Response) {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'No refresh token' }]
            });
        }
        const decodedPayload = await jwtService.verifyTokenFull(oldRefreshToken);
        if (!decodedPayload||!decodedPayload.userId||!decodedPayload.iat) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const session = await sessionQueryRepository.getSession(decodedPayload.deviceId,decodedPayload.userId)
        if (!session) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const tokenIatDate = new Date(decodedPayload!.iat*1000);
        if(session.iat.getTime()!==tokenIatDate.getTime()) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{message: 'Refresh token is no longer valid (was already refreshed)'}]
            });
        }
        const result = await securityService.deleteSession(session._id.toString());
        clearRefreshTokenCookie(res);
        if (result.status === ResultStatus.NoContent) {
            return res.status(HttpStatus.NoContent).json({
                message: 'Successfully logged out'
            });
        } else {
            return res.status(HttpStatus.Unauthorized).json({
                message: 'Logged out (token may be expired)'
            });
        }
    } catch(e: unknown) {
        errorHandler(e, res);
    }
}
function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh-token'
    });
}