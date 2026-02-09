import {authService} from "../application/auth.service";
import {HttpStatus} from "../../core/types/http-statuses";
import {Request, Response} from "express";
import {WithId} from "mongodb";
import {User} from "../../users/domain/user";
import {usersQueryRepository} from "../../users/repositories/user.query-repository";
import {UserOutput} from "../../users/routes/output/user-output";
import {errorHandler} from "../../core/errors/error.handler";
import {Result} from "../../core/result/result.type";
import {ResultStatus} from "../../core/result/result.code";
import {resultCodeToHttpException} from "../../core/result/resultCodeToHttpExeptions";
import {jwtService} from "../application/jwt.service";
import {sessionQueryRepository} from "../../securityDevices/repositories/session.query-repository";
import {securityService} from "../../securityDevices/application/security.services";

export class AuthController {
  static async  login(req: Request, res: Response) {
      const {loginOrEmail, password} = req.body;
      const deviceName = req.headers['user-agent'] ?? 'Unknown';
      const ipAddress = req.ip ?? 'unknown';
      const tokenResult = await authService.loginUser(loginOrEmail, password, deviceName, ipAddress);

      if(!tokenResult) {
          return res.sendStatus(HttpStatus.Unauthorized);
      }

      res.cookie('refreshToken', tokenResult.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 20 * 1000,
          path: '/auth/refresh-token',
      });

      return res.status(HttpStatus.Ok).json({
          accessToken: tokenResult.accessToken
      });
  }
  static async me(req: Request, res: Response) {
      try {
          if (!req.userId) {
              return res.sendStatus(HttpStatus.Unauthorized);
          }
          const userId: string = req.userId;
          const user: WithId<User> = await usersQueryRepository.findUserByIdOrFail(userId);
          const userOutput: UserOutput = await usersQueryRepository.mapToUserOutput(user);
          const {id,createdAt, ...userWithoutCreatedAt} = userOutput;
          const responseData = {
              ...userWithoutCreatedAt,
              userId: id,
          }
          return res.status(HttpStatus.Ok).json(responseData);

      } catch (e: unknown) {
          errorHandler(e,res);
      }
  }
  static async registration(req: Request, res: Response) {
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
  static async registrationConfirmation(req: Request, res: Response) {
      try {
          const codeFromEmail: string = req.body.code as string;
          const result = await authService.confirmUserRegistration(codeFromEmail);
          if(result.status!== ResultStatus.Success){
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
  static async registrationEmailResending(req: Request, res: Response) {
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
  static async refreshToken(req: Request, res: Response) {
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
          const tokenIatDate = new Date(iat * 1000);
          if(session.iat.getTime() !== tokenIatDate.getTime()) {
              return res.status(HttpStatus.Unauthorized).json({
                  errorsMessages: [{message: 'Refresh token is no longer valid (was already refreshed)'}]
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
  static async logout(req: Request, res: Response) {
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
          res.clearCookie('refreshToken', {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
              path: '/auth/refresh-token'
          });

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
}