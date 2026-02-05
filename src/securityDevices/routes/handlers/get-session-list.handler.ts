import {errorHandler} from "../../../core/errors/error.handler";
import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {jwtService} from "../../../auth/application/jwt.service";
import {sessionQueryRepository} from "../../repositories/session.query-repository";
import {ResultObject} from "../../../core/result/result.type";

export async function getSessionListHandler(req: Request, res: Response) {
    try {
        // const refreshToken = req.cookies.refreshToken;
        // if(!refreshToken){
        //     return res.status(HttpStatus.Unauthorized).json({
        //         errorsMessages: [{ message: 'No refresh token' }]
        //     });
        // }
        // const decodedPayload = await jwtService.verifyToken(refreshToken);
        // if (!decodedPayload|| !decodedPayload.userId) {
        //     return res.status(HttpStatus.Unauthorized).json({
        //         errorsMessages: [{ message: 'Refresh token is not valid' }]
        //     });
        // }
        const userId = req.userId;

        if (!userId) {
            return res.status(HttpStatus.Unauthorized).json({
                errorsMessages: [{ message: 'User not authenticated' }]
            });
        }

        const sessions = await sessionQueryRepository.getSessionsByUserId(userId);
        if(!sessions || sessions.length===0){
            // return res.status(HttpStatus.Unauthorized).json({
            //     errorsMessages: [{ message: 'No session found for user' }]
            // })
            return res.status(HttpStatus.Ok).json([]);
        }
        const sessionsOutput = await sessionQueryRepository.mapToSessionOutput(sessions);
        const result = ResultObject.Success(sessionsOutput);
        return res.status(HttpStatus.Ok).json(result.data);
    } catch (e: unknown) {
        errorHandler(e, res);
    }
}