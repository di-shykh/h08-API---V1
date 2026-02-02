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
exports.AccessTokenGuard = void 0;
const http_statuses_1 = require("../../core/types/http-statuses");
const jwt_service_1 = require("../application/jwt.service");
const error_handler_1 = require("../../core/errors/error.handler");
const AccessTokenGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.headers.authorization)
            return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        const [authType, token] = req.headers.authorization.split(' ');
        if (authType !== 'Bearer')
            return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        if (!token)
            return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        const payload = yield jwt_service_1.jwtService.verifyToken(token);
        if (payload) {
            const { userId } = payload;
            req.userId = userId;
            next();
            return;
        }
        res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        return;
    }
    catch (err) {
        (0, error_handler_1.errorHandler)(err, res);
    }
});
exports.AccessTokenGuard = AccessTokenGuard;
//# sourceMappingURL=access.token.guard.js.map