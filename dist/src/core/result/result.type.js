"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultObject = void 0;
const result_code_1 = require("./result.code");
//helper для создания результатов
class ResultObject {
    static Created(data) {
        return {
            status: result_code_1.ResultStatus.Created,
            data,
            errorMessage: '',
            extensions: [],
        };
    }
    static Success(data) {
        return {
            status: result_code_1.ResultStatus.Success,
            data,
            errorMessage: '',
            extensions: [],
        };
    }
    static NoContent() {
        return {
            status: result_code_1.ResultStatus.NoContent,
            data: null,
            errorMessage: '',
            extensions: [],
        };
    }
    static NotFound(field, message) {
        return {
            status: result_code_1.ResultStatus.NotFound,
            data: null,
            errorMessage: 'Not Found',
            extensions: [{ field, message }],
        };
    }
    static BadRequest(field, message) {
        return {
            status: result_code_1.ResultStatus.BadRequest,
            data: null,
            errorMessage: 'Bad Request',
            extensions: [{ field, message }],
        };
    }
    static Forbidden() {
        return {
            status: result_code_1.ResultStatus.Forbidden,
            data: null,
            errorMessage: 'Forbidden',
            extensions: [],
        };
    }
    static Unauthorized() {
        return {
            status: result_code_1.ResultStatus.Unauthorized,
            data: null,
            errorMessage: 'Unauthorized',
            extensions: [],
        };
    }
    static InternalServerError(message) {
        return {
            status: result_code_1.ResultStatus.InternalServerError,
            data: null,
            errorMessage: message || 'Internal Server Error',
            extensions: [],
        };
    }
}
exports.ResultObject = ResultObject;
//# sourceMappingURL=result.type.js.map