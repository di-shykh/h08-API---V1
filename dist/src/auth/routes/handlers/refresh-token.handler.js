"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenHandler = refreshTokenHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const auth_service_1 = require("../../application/auth.service");
const jwt_service_1 = require("../../application/jwt.service");
const error_handler_1 = require("../../../core/errors/error.handler");
function refreshTokenHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            if (!oldRefreshToken) {
                return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
                    errorsMessages: [{ message: 'No refresh token' }]
                });
            }
            const decodedPayload = yield jwt_service_1.jwtService.verifyToken(oldRefreshToken);
            if (!decodedPayload || !decodedPayload.userId) {
                return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            }
            yield auth_service_1.authService.addTokenToBlackList(oldRefreshToken);
            const tokenResult = yield jwt_service_1.jwtService.createToken(decodedPayload.userId);
            res.cookie('refreshToken', tokenResult.refreshToken, {
                httpOnly: true,
                secure: true, //process.env.NODE_ENV === 'production', (HTTPS)
                sameSite: 'strict', // или 'lax' / 'none'
                maxAge: 20 * 1000, // х
                path: '/auth/refresh-token', // доступен для всех путей
            });
            return res.status(http_statuses_1.HttpStatus.Ok).json({
                accessToken: tokenResult.accessToken
            });
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=refresh-token.handler.js.map