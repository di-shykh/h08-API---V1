import {HttpStatus} from "../../core/types/http-statuses";
import {Request, Response} from "express";
import {WithId} from "mongodb";
import {User} from "../../users/domain/user";
import {UserOutput} from "../../users/routes/output/user-output";
import {errorHandler} from "../../core/errors/error.handler";
import {Result} from "../../core/result/result.type";
import {ResultStatus} from "../../core/result/result.code";
import {resultCodeToHttpException} from "../../core/result/resultCodeToHttpExeptions";
import {AuthService} from "../application/auth.service";
import {JwtService} from "../application/jwt.service";
import {SecurityService} from "../../securityDevices/application/security.services";
import {SessionQueryRepository} from "../../securityDevices/repositories/session.query-repository";
import {UsersQueryRepository} from "../../users/repositories/user.query-repository";
import { injectable, inject } from 'inversify';
import {UsersRepository} from "../../users/repositories/user.repository";
import {UserDocument} from "../../users/domain/user.entity";

@injectable()
export class AuthController {
    authService: AuthService;
    jwtService: JwtService;
    securityService: SecurityService;
    sessionQueryRepository: SessionQueryRepository;
    usersQueryRepository: UsersQueryRepository;

    constructor(
        @inject(AuthService) authService: AuthService,
        @inject(JwtService) jwtService: JwtService,
        @inject(SecurityService) securityService: SecurityService,
        @inject(SessionQueryRepository) sessionQueryRepository: SessionQueryRepository,
        @inject(UsersRepository) usersQueryRepository: UsersQueryRepository
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.securityService = securityService;
        this.sessionQueryRepository = sessionQueryRepository;
        this.usersQueryRepository = usersQueryRepository;
    }
  async  login(req: Request, res: Response) {
      const {loginOrEmail, password} = req.body;
      const deviceName = req.headers['user-agent'] ?? 'Unknown';
      const ipAddress = req.ip ?? 'unknown';
      const tokenResult = await this.authService.loginUser(loginOrEmail, password, deviceName, ipAddress);

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
  async me(req: Request, res: Response) {
      try {
          if (!req.userId) {
              return res.sendStatus(HttpStatus.Unauthorized);
          }
          const userId: string = req.userId;
          const user: UserDocument = await this.usersQueryRepository.findUserByIdOrFail(userId);
          const userOutput: UserOutput = this.usersQueryRepository.mapToUserOutput(user);
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
  async registration(req: Request, res: Response) {
      try {
          const {login, password, email} = req.body;
          const result: Result<string|null> = await this.authService.createUser({login, email, password});
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
  async registrationConfirmation(req: Request, res: Response) {
      try {
          const codeFromEmail: string = req.body.code as string;
          const result = await this.authService.confirmUserRegistration(codeFromEmail);
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
  async registrationEmailResending(req: Request, res: Response) {
      try{
          const {email} = req.body;
          const result= await this.authService.resendEmail(email);
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
  async refreshToken(req: Request, res: Response) {
      try {
          const oldRefreshToken = req.cookies.refreshToken;
          if (!oldRefreshToken) {
              return res.status(HttpStatus.Unauthorized).json({
                  errorsMessages: [{ message: 'No refresh token' }]
              });
          }
          const decodedPayload = await this.jwtService.verifyTokenFull(oldRefreshToken);
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
          const session = await this.sessionQueryRepository.getSession(deviceId, decodedPayload.userId);
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
          const tokenResult = await this.securityService.refreshToken(session);
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
  async logout(req: Request, res: Response) {
      try {
          const oldRefreshToken = req.cookies.refreshToken;
          if (!oldRefreshToken) {
              return res.status(HttpStatus.Unauthorized).json({
                  errorsMessages: [{ message: 'No refresh token' }]
              });
          }
          const decodedPayload = await this.jwtService.verifyTokenFull(oldRefreshToken);
          if (!decodedPayload||!decodedPayload.userId||!decodedPayload.iat) {
              return res.sendStatus(HttpStatus.Unauthorized);
          }
          const session = await this.sessionQueryRepository.getSession(decodedPayload.deviceId,decodedPayload.userId)
          if (!session) {
              return res.sendStatus(HttpStatus.Unauthorized);
          }
          const tokenIatDate = new Date(decodedPayload!.iat*1000);
          if(session.iat.getTime()!==tokenIatDate.getTime()) {
              return res.status(HttpStatus.Unauthorized).json({
                  errorsMessages: [{message: 'Refresh token is no longer valid (was already refreshed)'}]
              });
          }
          const result = await this.securityService.deleteSession(session._id.toString());
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
  async passwordRecovery(req: Request, res: Response) {
        try {
            const {email} = req.body;
            const result = await this.authService.passwordRecovery(email);
            if(result.status!== ResultStatus.NoContent){
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
  async newPassword(req: Request, res: Response) {
        try{
            const {newPassword, recoveryCode} = req.body;
            const result =  await this.authService.newPassword(newPassword, recoveryCode);
            if(result.status!== ResultStatus.NoContent){
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
}
