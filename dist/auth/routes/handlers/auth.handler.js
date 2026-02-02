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
exports.authHandler = authHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const auth_service_1 = require("../../application/auth.service");
function authHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { loginOrEmail, password } = req.body;
        const tokenResult = yield auth_service_1.authService.loginUser(loginOrEmail, password);
        if (!tokenResult) {
            return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        }
        res.cookie('refreshToken', tokenResult.refreshToken, {
            httpOnly: true,
            secure: true, //process.env.NODE_ENV === 'production', (HTTPS)
            sameSite: 'strict', // или 'lax' / 'none'
            maxAge: 20 * 1000, // 1 час в миллисекундах
            path: '/auth/refresh-token', // доступен для всех путей
        });
        return res.status(http_statuses_1.HttpStatus.Ok).json({
            accessToken: tokenResult.accessToken
        });
    });
}
//# sourceMappingURL=auth.handler.js.map