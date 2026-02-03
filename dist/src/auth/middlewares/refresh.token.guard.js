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
exports.RefereshTokenGuard = void 0;
const http_statuses_1 = require("../../core/types/http-statuses");
const jwt_service_1 = require("../application/jwt.service");
const error_handler_1 = require("../../core/errors/error.handler");
const session_query_repository_1 = require("../../securityDevices/repositories/session.query-repository");
const RefereshTokenGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(http_statuses_1.HttpStatus.Unauthorized).json({ errorsMessages: [{ token: 'No refresh token' }] });
        }
        const payload = yield jwt_service_1.jwtService.verifyTokenFull(refreshToken);
        if (!payload) {
            return res.status(http_statuses_1.HttpStatus.Unauthorized).json({ errorsMessages: [{ token: 'Invalid refresh token' }]
            });
        }
        const userId = payload.userId;
        const deviceId = payload.deviceId;
        const resultFromSession = yield session_query_repository_1.sessionQueryRepository.getSession(deviceId, userId);
        if (!resultFromSession) {
            return res.status(http_statuses_1.HttpStatus.Unauthorized).json({ errorsMessages: [{ token: 'Refresh token expired or not exist' }]
            });
        }
        req.userId = userId;
        next();
        return;
    }
    catch (e) {
        (0, error_handler_1.errorHandler)(e, res);
    }
});
exports.RefereshTokenGuard = RefereshTokenGuard;
//# sourceMappingURL=refresh.token.guard.js.map