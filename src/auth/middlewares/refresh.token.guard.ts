import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../application/jwt.service";
import {errorHandler} from "../../core/errors/error.handler";
import {bcryptService} from "../adapters/bcrypt.service";
import {blacklistRepository} from "../repositories/blacklist.repository";

export const RefereshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
   try{
       const refreshToken = req.cookies.refresh_token;
       if (!refreshToken) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'No refresh token'}] });
       }
       const userId = jwtService.verifyToken(refreshToken);
       if (!userId) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Invalid refresh token'}]
               })
       }
       const tokenHash = await bcryptService.generateHash(refreshToken);
       const resultFromBlackList = await blacklistRepository.isTokenBlacklisted(tokenHash);
       if(resultFromBlackList) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Refresh token expired'}]
               })
       }
       next();
       return;
   } catch (e: unknown) {
       errorHandler(e,res);
   }
}