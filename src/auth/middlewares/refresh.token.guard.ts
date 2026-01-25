import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../application/jwt.service";
import {errorHandler} from "../../core/errors/error.handler";
import {bcryptService} from "../adapters/bcrypt.service";

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
       // const passwordHash: string = await bcryptService.generateHash(password);
       const tokenHash = await bcryptService.generateHash(password);
       const result = await

   } catch (e) {
       errorHandler(e,res);
   }
}