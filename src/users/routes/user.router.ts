import {Router} from "express";
import {paginationAndSortingValidation} from "../../core/middlewares/validation/query-pagination-sorting.validation";
import {UserSortField} from "./input/user-sort-field";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {superAdminMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {userCreateValidation} from "./user.input-dto.validation-middleware";
import {idValidator} from "../../core/middlewares/validation/params-id.validation-middleware";
import {query} from "express-validator";
import {container} from "../../inversify-ioc";
import {UserController} from "./user.controller";

const userController = container.get(UserController);
export const usersRouter: Router = Router({});

usersRouter
    .get(
        "",
        superAdminMiddleware,
        [
            ...paginationAndSortingValidation(UserSortField),
            query('searchLoginTerm').optional().isString().trim(),
            query('searchEmailTerm').optional().isString().trim()
        ],
        inputValidationResultMiddleware,
        userController.getUserList.bind(userController)
    )
    .post(
        "",
        superAdminMiddleware,
        userCreateValidation,
        inputValidationResultMiddleware,
        userController.createUser.bind(userController)
    )
    .delete(
        "/:id",
        superAdminMiddleware,
        idValidator,
        inputValidationResultMiddleware,
        userController.deleteUser.bind(userController)
    );
