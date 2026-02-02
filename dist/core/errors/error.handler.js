"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const repository_not_found_error_1 = require("./repository-not-found.error");
const http_statuses_1 = require("../types/http-statuses");
const domain_error_1 = require("./domain.error");
const duplicateField_error_1 = require("./duplicateField.error");
// Функция для создания ошибок в нужном формате
const createErrorResult = (errors) => {
    return {
        errorsMessages: errors.map(error => ({
            message: error.message,
            field: error.field || '',
        }))
    };
};
function errorHandler(error, res) {
    if (error instanceof duplicateField_error_1.DuplicateFieldError) {
        res.status(http_statuses_1.HttpStatus.BadRequest).json(createErrorResult([
            {
                message: error.message,
                field: error.field || '',
            },
        ]));
    }
    if (error instanceof repository_not_found_error_1.RepositoryNotFoundError) {
        res.status(http_statuses_1.HttpStatus.NotFound).json(createErrorResult([
            { message: error.message },
        ]));
        return;
    }
    if (error instanceof domain_error_1.DomainError) {
        res.status(http_statuses_1.HttpStatus.BadRequest).json(createErrorResult([
            {
                message: error.message,
                field: error.field || '',
            },
        ]));
        return;
    }
    res.status(http_statuses_1.HttpStatus.InternalServerError).json(createErrorResult([
        { message: "Internal server error" },
    ]));
    return;
}
//# sourceMappingURL=error.handler.js.map