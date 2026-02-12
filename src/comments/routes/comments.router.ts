import {Router} from "express";
import {idValidator} from "../../core/middlewares/validation/params-id.validation-middleware";
import {AccessTokenGuard} from "../../auth/middlewares/access.token.guard";
import {commentInputValidation} from "./comment.input-dto.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {commentsController} from "../../composition.root";

export const commentsRouter: Router = Router({});
commentsRouter
    .get(
        "/:id",
        idValidator,
        commentsController.getComment.bind(commentsController)
    )
    .delete(
        "/:id",
        AccessTokenGuard,
        idValidator,
        commentsController.deleteComment.bind(commentsController)
    )
    .put (
        "/:id",
        AccessTokenGuard,
        idValidator,
        commentInputValidation,
        inputValidationResultMiddleware,
        commentsController.updateComment.bind(commentsController)
    )