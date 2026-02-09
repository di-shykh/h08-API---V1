import {authService} from "../application/auth.service";
import {HttpStatus} from "../../core/types/http-statuses";
import {Request, Response} from "express";

export class AuthController {
   async  login(req: Request, res: Response) {
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
}