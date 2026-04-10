import { NextFunction, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {RateLimitDocument, RateLimitModel} from "../domain/rate-limit.entity";

export const rateLimitGuard= async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const LIMIT_COUNT= 5;
        const TIME_WINDOW_MS = 10 * 1000;
        const EXTRA_BUFFER_MS = 1000;

        const ip: string = req.ip || 'unknown';
        const url: string =req.originalUrl || req.baseUrl || req.url || '/';
        const date: Date = new Date();
        const timeLimit = new Date(Date.now() - TIME_WINDOW_MS);
        const deleteTimeLimit = new Date(Date.now() - (TIME_WINDOW_MS + EXTRA_BUFFER_MS));



        const requestsCount: number = await RateLimitModel.countDocuments({
            ip, url, date: {$gte: timeLimit}
        });

        if (requestsCount >= LIMIT_COUNT) {
            return res.status(HttpStatus.TooManyRequests).json({
                errorsMessages: [{ message: 'Too many requests' }]
            });
        }

        await RateLimitModel.deleteMany({
            date: { $lt: deleteTimeLimit }
        });

        const result: RateLimitDocument = await RateLimitModel.create({ip, url, date});

        if(!result._id){
            return res.sendStatus(HttpStatus.InternalServerError);
        }

        next();

    } catch (e: unknown) {
        errorHandler(e,res);
    }
}