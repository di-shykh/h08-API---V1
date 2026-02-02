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
exports.registrationHandler = registrationHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const auth_service_1 = require("../../application/auth.service");
const result_code_1 = require("../../../core/result/result.code");
const resultCodeToHttpExeptions_1 = require("../../../core/result/resultCodeToHttpExeptions");
const http_statuses_1 = require("../../../core/types/http-statuses");
function registrationHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { login, password, email } = req.body;
            const result = yield auth_service_1.authService.createUser({ login, email, password });
            if (result.status !== result_code_1.ResultStatus.Success) {
                res.status((0, resultCodeToHttpExeptions_1.resultCodeToHttpException)(result.status)).json({
                    errorsMessages: result.extensions || []
                });
                return;
            }
            res.status(http_statuses_1.HttpStatus.NoContent).send();
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=registration.handler.js.map