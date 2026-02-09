import { NextFunction, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../../composition.root";
import {errorHandler} from "../../core/errors/error.handler";

export const AccessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(!req.headers.authorization) return res.sendStatus(HttpStatus.Unauthorized);
        const [authType, token] = req.headers.authorization.split(' ');
        if(authType!=='Bearer') return res.sendStatus(HttpStatus.Unauthorized);
        if(!token) return res.sendStatus(HttpStatus.Unauthorized);
        const payload = await jwtService.verifyToken(token);
        if(payload) {
            const {userId} = payload;
            req.userId = userId;
            next();
            return;
        }
        res.sendStatus(HttpStatus.Unauthorized);
        return;
    } catch(err: unknown){
        errorHandler(err,res);
    }
}