"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRouter = void 0;
const express_1 = require("express");
const get_post_handler_1 = require("./handlers/get-post.handler");
const get_post_list_handler_1 = require("./handlers/get-post-list.handler");
const create_post_handler_1 = require("./handlers/create-post.handler");
const update_post_handler_1 = require("./handlers/update-post.handler");
const delete_post_handler_1 = require("./handlers/delete-post.handler");
const params_id_validation_middleware_1 = require("../../core/middlewares/validation/params-id.validation-middleware");
const input_validation_result_middleware_1 = require("../../core/middlewares/validation/input-validation.result.middleware");
const post_input_dto_validation_middlewares_1 = require("./post.input-dto.validation-middlewares");
const super_admin_guard_middleware_1 = require("../../auth/middlewares/super-admin.guard-middleware");
const query_pagination_sorting_validation_1 = require("../../core/middlewares/validation/query-pagination-sorting.validation");
const post_sort_field_1 = require("./input/post-sort-field");
const access_token_guard_1 = require("../../auth/middlewares/access.token.guard");
const comment_input_dto_validation_middleware_1 = require("../../comments/routes/comment.input-dto.validation-middleware");
const create_comment_handler_1 = require("../../comments/routes/handlers/create-comment.handler");
const get_comment_list_handler_1 = require("../../comments/routes/handlers/get-comment-list.handler");
exports.postsRouter = (0, express_1.Router)({});
exports.postsRouter
    .get("", (0, query_pagination_sorting_validation_1.paginationAndSortingValidation)(post_sort_field_1.PostSortField), input_validation_result_middleware_1.inputValidationResultMiddleware, get_post_list_handler_1.getPostListHandler)
    .get("/:id", params_id_validation_middleware_1.idValidator, input_validation_result_middleware_1.inputValidationResultMiddleware, get_post_handler_1.getPostHandler)
    .post("", super_admin_guard_middleware_1.superAdminMiddleware, post_input_dto_validation_middlewares_1.postCreateInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, create_post_handler_1.createPostHandler)
    .put("/:id", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, post_input_dto_validation_middlewares_1.postUpdateInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, update_post_handler_1.updatePostHandler)
    .delete("/:id", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, input_validation_result_middleware_1.inputValidationResultMiddleware, delete_post_handler_1.deletePostHandler)
    .post("/:id/comments", access_token_guard_1.AccessTokenGuard, params_id_validation_middleware_1.idValidator, comment_input_dto_validation_middleware_1.commentInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, create_comment_handler_1.createCommentHandler)
    .get("/:id/comments", params_id_validation_middleware_1.idValidator, (0, query_pagination_sorting_validation_1.paginationAndSortingValidation)(post_sort_field_1.PostSortField), input_validation_result_middleware_1.inputValidationResultMiddleware, get_comment_list_handler_1.getCommentListHandler);
//# sourceMappingURL=posts.router.js.map