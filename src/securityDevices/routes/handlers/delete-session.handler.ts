import {Request, Response} from "express";
import {errorHandler} from "../../../core/errors/error.handler";
import {HttpStatus} from "../../../core/types/http-statuses";
import {jwtService} from "../../../auth/application/jwt.service";
import {securityService} from "../../application/security.services";
import {ResultStatus} from "../../../core/result/result.code";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpExeptions";
import {Result} from "../../../core/result/result.type";

export async function deleteSessionHandler(req: Request, res: Response) {
    try {
        const userId = req.userId;
        const deviceId = req.params.id as string;
        const result: Result = await securityService.deleteSessionByDeviceId(deviceId, userId!);
        if (result.status===ResultStatus.Forbidden) {
            res.status(resultCodeToHttpException(ResultStatus.Forbidden)).json({
                errorsMessages: result.errorMessage
            });
            return;
        }
        if (result.status === ResultStatus.NotFound) {
            res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                errorsMessages: result.errorMessage
            });
            return;
        }
        if(result.status === ResultStatus.NoContent) {
            res.sendStatus(HttpStatus.NoContent);
        }
    } catch (e: unknown) {
        errorHandler(e, res);


    }
}