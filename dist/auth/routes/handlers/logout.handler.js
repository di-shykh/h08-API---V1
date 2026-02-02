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
exports.logoutHandler = logoutHandler;
const jwt_service_1 = require("../../application/jwt.service");
const http_statuses_1 = require("../../../core/types/http-statuses");
const auth_service_1 = require("../../application/auth.service");
const error_handler_1 = require("../../../core/errors/error.handler");
const result_code_1 = require("../../../core/result/result.code");
function logoutHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            if (!oldRefreshToken) {
                return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
                    errorsMessages: [{ message: 'No refresh token' }]
                });
            }
            const decodedPayload = yield jwt_service_1.jwtService.verifyToken(oldRefreshToken);
            if (!decodedPayload) {
                return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            }
            const result = yield auth_service_1.authService.addTokenToBlackList(oldRefreshToken);
            clearRefreshTokenCookie(res);
            if (result.status === result_code_1.ResultStatus.Success) {
                return res.status(http_statuses_1.HttpStatus.NoContent).json({
                    message: 'Successfully logged out'
                });
            }
            else {
                // Токен добавлен в чёрный список, но была какая-то проблема
                return res.status(http_statuses_1.HttpStatus.NoContent).json({
                    message: 'Logged out (token may be expired)'
                });
            }
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
function clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token'
    });
}
//# sourceMappingURL=logout.handler.js.map