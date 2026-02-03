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
const error_handler_1 = require("../../../core/errors/error.handler");
const result_code_1 = require("../../../core/result/result.code");
const security_services_1 = require("../../../securityDevices/application/security.services");
const session_query_repository_1 = require("../../../securityDevices/repositories/session.query-repository");
function logoutHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            if (!oldRefreshToken) {
                return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
                    errorsMessages: [{ message: 'No refresh token' }]
                });
            }
            const decodedPayload = yield jwt_service_1.jwtService.verifyTokenFull(oldRefreshToken);
            if (!decodedPayload) {
                return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            }
            const session = yield session_query_repository_1.sessionQueryRepository.getSession(decodedPayload.deviceId, decodedPayload.userId);
            if (!session) {
                return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            }
            const result = yield security_services_1.securityService.deleteSession(session._id.toString());
            clearRefreshTokenCookie(res);
            if (result.status === result_code_1.ResultStatus.NoContent) {
                return res.status(http_statuses_1.HttpStatus.NoContent).json({
                    message: 'Successfully logged out'
                });
            }
            else {
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
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh-token'
    });
}
//# sourceMappingURL=logout.handler.js.map