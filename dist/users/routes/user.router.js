"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const query_pagination_sorting_validation_1 = require("../../core/middlewares/validation/query-pagination-sorting.validation");
const user_sort_field_1 = require("./input/user-sort-field");
const input_validation_result_middleware_1 = require("../../core/middlewares/validation/input-validation.result.middleware");
const get_user_list_handler_1 = require("./handlers/get-user-list.handler");
const super_admin_guard_middleware_1 = require("../../auth/middlewares/super-admin.guard-middleware");
const user_input_dto_validation_middleware_1 = require("./user.input-dto.validation-middleware");
const create_user_handler_1 = require("./handlers/create-user.handler");
const params_id_validation_middleware_1 = require("../../core/middlewares/validation/params-id.validation-middleware");
const delete_user_handler_1 = require("./handlers/delete-user.handler");
const express_validator_1 = require("express-validator");
exports.usersRouter = (0, express_1.Router)({});
exports.usersRouter
    .get("", super_admin_guard_middleware_1.superAdminMiddleware, [
    ...(0, query_pagination_sorting_validation_1.paginationAndSortingValidation)(user_sort_field_1.UserSortField),
    (0, express_validator_1.query)('searchLoginTerm').optional().isString().trim(),
    (0, express_validator_1.query)('searchEmailTerm').optional().isString().trim()
], input_validation_result_middleware_1.inputValidationResultMiddleware, get_user_list_handler_1.getUserListHandler)
    .post("", super_admin_guard_middleware_1.superAdminMiddleware, user_input_dto_validation_middleware_1.userCreateValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, create_user_handler_1.createUserHandler)
    .delete("/:id", super_admin_guard_middleware_1.superAdminMiddleware, params_id_validation_middleware_1.idValidator, input_validation_result_middleware_1.inputValidationResultMiddleware, delete_user_handler_1.deleteUserHandler);
//# sourceMappingURL=user.router.js.map