import {Router} from "express";
import {idValidator} from "../../core/middlewares/validation/params-id.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {
    postCreateInputValidation,
    postUpdateInputValidation
} from "./post.input-dto.validation-middlewares";
import {superAdminMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {paginationAndSortingValidation} from "../../core/middlewares/validation/query-pagination-sorting.validation";
import {PostSortField} from "./input/post-sort-field";
import {AccessTokenGuard} from "../../auth/middlewares/access.token.guard";
import { commentInputValidation} from "../../comments/routes/comment.input-dto.validation-middleware";
import {PostsController} from "./posts.controller";
import {container} from "../../inversify-ioc";
import {AccessTokenOptional} from "../../auth/middlewares/access.token.optional";

const postsController = container.get(PostsController);
export const postsRouter: Router = Router({});

postsRouter
    .get(
        "",
        AccessTokenOptional,
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        postsController.getPostList.bind(postsController)
    )
    .get(
        "/:id",
        AccessTokenOptional,
        idValidator,
        inputValidationResultMiddleware,
        postsController.getPost.bind(postsController)
    )
    .post(
        "",
        superAdminMiddleware,
        postCreateInputValidation,
        inputValidationResultMiddleware,
        postsController.createPost.bind(postsController)
    )
    .put(
        "/:id",
        superAdminMiddleware,
        idValidator,
        postUpdateInputValidation,
        inputValidationResultMiddleware,
        postsController.updatePost.bind(postsController)
    )
    .delete(
        "/:id",
        superAdminMiddleware,
        idValidator,
        inputValidationResultMiddleware,
        postsController.deletePost.bind(postsController)
    )
    .post(
        "/:id/comments",
        AccessTokenGuard,
        idValidator,
        commentInputValidation,
        inputValidationResultMiddleware,
        postsController.createComment.bind(postsController)
    )
    .get(
        "/:id/comments",
        AccessTokenOptional,
        idValidator,
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        postsController.getCommentList.bind(postsController)
    )
    .put(
        "/:id/like-status",
        AccessTokenGuard,
        idValidator,
        postsController.changeExtendedLikeStatus.bind(postsController)
    )