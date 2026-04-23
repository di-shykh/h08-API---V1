import { NextFunction, Request, Response } from 'express';
import {jwtService} from "../../composition.root";
import {errorHandler} from "../../core/errors/error.handler";

export const AccessTokenOptional = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const [authType, token] = authHeader.split(' ');
            const payload = await jwtService.verifyToken(token);
            if(payload) {
                const {userId} = payload;
                req.userId = userId;
            }
        }
    } catch(err: unknown){

    }
    next();
}