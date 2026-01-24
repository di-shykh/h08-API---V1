import {Request, Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import cookieParser from "cookie-parser";
import {jwtService} from "../../application/jwt.service";

export async function refreshTokenHandler (req: Request, res: Response) {


}