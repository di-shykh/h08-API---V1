import { NextFunction, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {rateLimitCollection} from "../../db/mongo.bd";
import {InsertOneResult} from "mongodb";
import {RateLimit} from "../types/rate-limit";

export const rateLimitGuard= async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const LIMIT_COUNT= 5;
        const TIME_WINDOW_MS = 10 * 1000;
        const EXTRA_BUFFER_MS = 1000;

        const ip: string = req.ip || 'unknown';
        const url: string = req.baseUrl || req.originalUrl || req.url || '/';
        const date: Date = new Date();
        const timeLimit = new Date(Date.now() - TIME_WINDOW_MS);
        const deleteTimeLimit = new Date(Date.now() - (TIME_WINDOW_MS + EXTRA_BUFFER_MS));

        await rateLimitCollection.deleteMany({
            date: { $lt: deleteTimeLimit }
        });

        const requestsCount: number = await rateLimitCollection.countDocuments({
            ip, url, date: {$gte: timeLimit}
        });

        if (requestsCount >= LIMIT_COUNT) {
            return res.status(HttpStatus.TooManyRequests).json({
                errorsMessages: [{ message: 'Too many requests' }]
            });
        }
        const result: InsertOneResult<RateLimit> = await rateLimitCollection.insertOne({ip, url, date});

        if(!result.insertedId){
            return res.sendStatus(HttpStatus.InternalServerError);
        }

        next();

    } catch (e: unknown) {
        errorHandler(e,res);
    }
}