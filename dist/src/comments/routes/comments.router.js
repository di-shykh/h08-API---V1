"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsRouter = void 0;
const express_1 = require("express");
const params_id_validation_middleware_1 = require("../../core/middlewares/validation/params-id.validation-middleware");
const get_comment_handler_1 = require("./handlers/get-comment.handler");
const access_token_guard_1 = require("../../auth/middlewares/access.token.guard");
const delete_comment_handler_1 = require("./handlers/delete-comment.handler");
const update_comment_handler_1 = require("./handlers/update-comment.handler");
const comment_input_dto_validation_middleware_1 = require("./comment.input-dto.validation-middleware");
const input_validation_result_middleware_1 = require("../../core/middlewares/validation/input-validation.result.middleware");
exports.commentsRouter = (0, express_1.Router)({});
exports.commentsRouter
    .get("/:id", params_id_validation_middleware_1.idValidator, get_comment_handler_1.getCommentHandler)
    .delete("/:id", access_token_guard_1.AccessTokenGuard, params_id_validation_middleware_1.idValidator, delete_comment_handler_1.deleteCommentHandler)
    .put("/:id", access_token_guard_1.AccessTokenGuard, params_id_validation_middleware_1.idValidator, comment_input_dto_validation_middleware_1.commentInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, update_comment_handler_1.updateCommentHandler);
//# sourceMappingURL=comments.router.js.map