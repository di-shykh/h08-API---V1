import {Response, Request} from "express";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/result.code";
import {resultCodeToHttpException} from "../../../core/result/resultCodeToHttpExeptions";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorHandler} from "../../../core/errors/error.handler";

export async function registrationEmailResendingHandler(req: Request, res: Response) {
   try{
       const {email} = req.body;
       const result= await authService.resendEmail(email);
       if(result.status !== ResultStatus.Success){
           if (result.status === ResultStatus.BadRequest) {
               return res.status(HttpStatus.BadRequest).json({
                   errorsMessages: result.extensions
               });
           }
           return res.status(resultCodeToHttpException(result.status)).json({
               errorsMessages: result.extensions||[]
           });

       }
       res.status(HttpStatus.NoContent).send();
   } catch (e) {
       errorHandler(e, res);
   }
}