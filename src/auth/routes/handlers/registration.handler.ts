import {Request, Response} from "express";
import {errorHandler} from "../../../core/errors/error.handler";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/result.code";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpExeptions";
import {HttpStatus} from "../../../core/types/http-statuses";
import {Result} from "../../../core/result/result.type";

export async function registrationHandler(req: Request, res: Response) {
    try {
        const {login, password, email} = req.body;
        const result: Result<string|null> = await authService.createUser({login, email, password});
        if(result.status!== ResultStatus.Success){
            res.status(resultCodeToHttpException(result.status)).json({
                errorsMessages: result.extensions||[]
            });
            return;
        }
        res.status(HttpStatus.NoContent).send();
    } catch (e) {
        errorHandler(e,res);
    }
}