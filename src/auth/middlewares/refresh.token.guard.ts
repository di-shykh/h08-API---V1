import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../application/jwt.service";
import {errorHandler} from "../../core/errors/error.handler";
import {sessionQueryRepository} from "../../securityDevices/repositories/session.query-repository";

export const RefreshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
   try{
       const refreshToken = req.cookies.refreshToken;
       if (!refreshToken) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'No refresh token'}] });
       }
       const payload = await jwtService.verifyTokenFull(refreshToken);
       if (!payload) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Invalid refresh token'}]
               })
       }
       const userId: string = payload.userId;
       const deviceId: string = payload.deviceId;

       if (!userId || !deviceId) {
           return res.status(HttpStatus.Unauthorized).json({
               errorsMessages: [{ message: 'Invalid token payload' }]
           });
       }
       const resultFromSession = await sessionQueryRepository.getSession(deviceId,userId);
       if(!resultFromSession) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Refresh token expired or not exist'}]
               })
       }
       req.userId = userId;
       req.deviceId = deviceId;
       next();
       return;
   } catch (e: unknown) {
       errorHandler(e,res);
   }
}