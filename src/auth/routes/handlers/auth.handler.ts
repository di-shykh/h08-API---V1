import {LoginInputDto} from "../../application/dtos/loginInputDto";
import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";

export async function authHandler(req: Request <{}, {}, LoginInputDto>, res: Response) {

    const {loginOrEmail, password} = req.body;
    const tokenResult = await authService.loginUser(loginOrEmail, password);
    if(!tokenResult) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    res.cookie('refreshToken', tokenResult.refreshToken, {
        httpOnly: true,
        secure: true, //process.env.NODE_ENV === 'production', (HTTPS)
        sameSite: 'strict', // или 'lax' / 'none'
        maxAge: 20 * 1000, // 1 час в миллисекундах
        path: '/auth/refresh-token', // доступен для всех путей
    });

    return res.status(HttpStatus.Ok).json({
        accessToken: tokenResult.accessToken
    });
}