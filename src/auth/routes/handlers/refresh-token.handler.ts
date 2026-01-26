import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import cookieParser from "cookie-parser";
import {jwtService} from "../../application/jwt.service";
import {errorHandler} from "../../../core/errors/error.handler";

export async function refreshTokenHandler (req: Request, res: Response) {
    try {
        const oldRefreshToken = req.cookies.refresh_token;
        const decodedPayload = await jwtService.verifyToken(oldRefreshToken);
        if (!decodedPayload|| !decodedPayload.userId) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
        const {accessToken, refreshToken} = await jwtService.createToken(decodedPayload.userId);
        await authService.addTokenToBlackList(oldRefreshToken, decodedPayload.userId);
    } catch(e: unknown) {
            errorHandler(e, res);
        }
}