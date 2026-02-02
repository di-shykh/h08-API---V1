"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultCodeToHttpException = void 0;
const result_code_1 = require("./result.code");
const http_statuses_1 = require("../types/http-statuses");
const resultCodeToHttpException = (resultCode) => {
    switch (resultCode) {
        case result_code_1.ResultStatus.Forbidden:
            return http_statuses_1.HttpStatus.Forbidden;
        case result_code_1.ResultStatus.BadRequest:
            return http_statuses_1.HttpStatus.BadRequest;
        case result_code_1.ResultStatus.Unauthorized:
            return http_statuses_1.HttpStatus.Unauthorized;
        case result_code_1.ResultStatus.NotFound:
            return http_statuses_1.HttpStatus.NotFound;
        case result_code_1.ResultStatus.InternalServerError:
            return http_statuses_1.HttpStatus.InternalServerError;
        default:
            return http_statuses_1.HttpStatus.InternalServerError;
    }
};
exports.resultCodeToHttpException = resultCodeToHttpException;
//# sourceMappingURL=resultCodeToHttpExeptions.js.map