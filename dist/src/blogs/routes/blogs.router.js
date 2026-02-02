"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const get_blog_handler_1 = require("./handlers/get-blog.handler");
const get_blog_list_handler_1 = require("./handlers/get-blog-list.handler");
const create_blog_handler_1 = require("./handlers/create-blog.handler");
const update_blog_handler_1 = require("./handlers/update-blog.handler");
const delete_blog_handler_1 = require("./handlers/delete-blog.handler");
const params_id_validation_middleware_1 = require("../../core/middlewares/validation/params-id.validation-middleware");
const input_validation_result_middleware_1 = require("../../core/middlewares/validation/input-validation.result.middleware");
const blog_input_dto_validation_middleware_1 = require("./blog.input-dto.validation-middleware");
const super_admin_guard_middleware_1 = require("../../auth/middlewares/super-admin.guard-middleware");
const query_pagination_sorting_validation_1 = require("../../core/middlewares/validation/query-pagination-sorting.validation");
const blog_sort_field_1 = require("./input/blog-sort-field");
const get_blog_post_list_handler_1 = require("./handlers/get-blog-post-list.handler");
const post_sort_field_1 = require("../../posts/routes/input/post-sort-field");
const post_input_dto_validation_middlewares_1 = require("../../posts/routes/post.input-dto.validation-middlewares");
const create_blog_post_handler_1 = require("./handlers/create-blog-post.handler");
const blog_existing_id_validation_middleware_1 = require("./blog.existing-id-validation-middleware");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter
    .get("", (0, query_pagination_sorting_validation_1.paginationAndSortingValidation)(blog_sort_field_1.BlogSortField), input_validation_result_middleware_1.inputValidationResultMiddleware, get_blog_list_handler_1.getBlogListHandler)
    .get("/:id", params_id_validation_middleware_1.idValidator, input_validation_result_middleware_1.inputValidationResultMiddleware, get_blog_handler_1.getBlogHandler)
    .post("", super_admin_guard_middleware_1.superAdminMiddleware, blog_input_dto_validation_middleware_1.blogCreateInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, create_blog_handler_1.createBlogHandler)
    .put("/:id", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, blog_input_dto_validation_middleware_1.blogUpdateInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, update_blog_handler_1.updateBlogHandler)
    .delete("/:id", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, input_validation_result_middleware_1.inputValidationResultMiddleware, delete_blog_handler_1.deleteBlogHandler)
    .get("/:id/posts", params_id_validation_middleware_1.idValidator, blog_existing_id_validation_middleware_1.blogExistingIdValidationMiddleware, (0, query_pagination_sorting_validation_1.paginationAndSortingValidation)(post_sort_field_1.PostSortField), input_validation_result_middleware_1.inputValidationResultMiddleware, get_blog_post_list_handler_1.getBlogPostListHandler)
    .post("/:id/posts", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, blog_existing_id_validation_middleware_1.blogExistingIdValidationMiddleware, post_input_dto_validation_middlewares_1.postCreateForBlogInputValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, create_blog_post_handler_1.createBlogPostHandler);
//# sourceMappingURL=blogs.router.js.map