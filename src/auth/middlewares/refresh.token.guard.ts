import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../application/jwt.service";
import {errorHandler} from "../../core/errors/error.handler";
import {blacklistRepository} from "../repositories/blacklist.repository";
import crypto from "crypto";

export const RefereshTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
   try{
       const refreshToken = req.cookies.refreshToken;
       if (!refreshToken) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'No refresh token'}] });
       }
       const payload = await jwtService.verifyToken(refreshToken);
       if (!payload) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Invalid refresh token'}]
               })
       }
       const userId: string = payload.userId;
       const tokenHash: string = crypto.createHash('sha256')
           .update(refreshToken + (process.env.HASH_SALT || ''))
           .digest('hex');
       const resultFromBlackList = await blacklistRepository.isTokenBlacklisted(tokenHash);
       if(resultFromBlackList) {
           return res.status(HttpStatus.Unauthorized).json(
               { errorsMessages: [{token: 'Refresh token expired'}]
               })
       }
       req.userId = userId;
       next();
       return;
   } catch (e: unknown) {
       errorHandler(e,res);
   }
}