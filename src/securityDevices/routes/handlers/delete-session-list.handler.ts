import {errorHandler} from "../../../core/errors/error.handler";
import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {jwtService} from "../../../auth/application/jwt.service";
import {securityService} from "../../application/security.services";
import {Result} from "../../../core/result/result.type";
import {ResultStatus} from "../../../core/result/result.code";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpExeptions";

export async function deleteSessionListHandler(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{message: 'No refresh token'}]
            });
        }
        const decodedPayload = await jwtService.verifyTokenFull(refreshToken);
        if (!decodedPayload || !decodedPayload.userId || decodedPayload.deviceId) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{message: 'Refresh token is not valid'}]
            });
        }
        const result: Result = await securityService.deleteSessionList(decodedPayload.userId, decodedPayload.deviceId);
        if(result.status===ResultStatus.NotFound) {
            res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                errorsMessages: result.errorMessage
            });
            return;
        }
        if(result.status===ResultStatus.NoContent) {
            res.sendStatus(HttpStatus.NoContent);
        }

    } catch (e) {
        errorHandler(e, res);
    }
}