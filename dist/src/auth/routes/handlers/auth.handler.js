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
        var _a, _b;
        const { loginOrEmail, password } = req.body;
        const deviceName = (_a = req.headers['user-agent']) !== null && _a !== void 0 ? _a : 'Unknown';
        const ipAddress = (_b = req.ip) !== null && _b !== void 0 ? _b : 'unknown';
        const tokenResult = yield auth_service_1.authService.loginUser(loginOrEmail, password, deviceName, ipAddress);
        if (!tokenResult) {
            return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        }
        res.cookie('refreshToken', tokenResult.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 20 * 1000,
            path: '/auth/refresh-token',
        });
        return res.status(http_statuses_1.HttpStatus.Ok).json({
            accessToken: tokenResult.accessToken
        });
    });
}
//# sourceMappingURL=auth.handler.js.map