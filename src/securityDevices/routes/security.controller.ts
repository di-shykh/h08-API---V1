import {HttpStatus} from "../../core/types/http-statuses";
import {Result, ResultObject} from "../../core/result/result.type";
import {errorHandler} from "../../core/errors/error.handler";
import {Request, Response} from "express";
import {ResultStatus} from "../../core/result/result.code";
import {resultCodeToHttpException} from "../../core/result/resultCodeToHttpExeptions";
import {SessionQueryRepository} from "../repositories/session.query-repository";
import {SecurityService} from "../application/security.services";
import { inject, injectable } from 'inversify';

@injectable()
export class SecurityController {
    sessionQueryRepository: SessionQueryRepository;
    securityService: SecurityService;

    constructor(
        @inject(SessionQueryRepository) sessionQueryRepository: SessionQueryRepository,
        @inject(SecurityService) securityService: SecurityService
    ) {
        this.sessionQueryRepository = sessionQueryRepository;
        this.securityService = securityService;
    }

   async getSessionList(req: Request, res: Response) {
       try {
           const userId = req.userId;
           if (!userId) {
               return res.status(HttpStatus.Unauthorized).json({
                   errorsMessages: [{ message: 'User not authenticated' }]
               });
           }
           const sessions = await this.sessionQueryRepository.getSessionsByUserId(userId);
           if(!sessions || sessions.length===0){
               return res.status(HttpStatus.Ok).json([]);
           }
           const sessionsOutput = await this.sessionQueryRepository.mapToSessionOutput(sessions);
           const result = ResultObject.Success(sessionsOutput);
           return res.status(HttpStatus.Ok).json(result.data);
       } catch (e: unknown) {
           errorHandler(e, res);
       }
   }
   async deleteSession(req: Request, res: Response) {
       try {
           const userId = req.userId;
           const deviceId = req.params.id as string;
           const result: Result = await this.securityService.deleteSessionByDeviceId(deviceId, userId!);
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
   async deleteSessionList(req: Request, res: Response) {
       try {
           const userId = req.userId;
           const deviceId = req.deviceId;
           if (!userId || !deviceId) {
               return res.status(HttpStatus.Unauthorized).json({
                   errorsMessages: [{message: 'Refresh token is not valid'}]
               });
           }
           const result: Result = await this.securityService.deleteSessionList(userId, deviceId);
           if(result.status === ResultStatus.NotFound) {
               res.status(resultCodeToHttpException(ResultStatus.NotFound)).json({
                   errorsMessages: result.errorMessage
               });
               return;
           }
           if(result.status === ResultStatus.NoContent) {
               res.sendStatus(HttpStatus.NoContent);
           }

       } catch (e) {
           errorHandler(e, res);
       }
   }
}
