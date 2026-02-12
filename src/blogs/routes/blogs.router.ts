import {Router} from "express";
import {idValidator} from "../../core/middlewares/validation/params-id.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {blogCreateInputValidation, blogUpdateInputValidation} from "./blog.input-dto.validation-middleware";
import {superAdminMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {paginationAndSortingValidation} from "../../core/middlewares/validation/query-pagination-sorting.validation";
import {BlogSortField} from "./input/blog-sort-field";
import {PostSortField} from "../../posts/routes/input/post-sort-field";
import {postCreateForBlogInputValidation} from "../../posts/routes/post.input-dto.validation-middlewares";
import {blogExistingIdValidationMiddleware} from "./blog.existing-id-validation-middleware";
import {blogsController} from "../../composition.root";

export const blogsRouter: Router = Router({});

blogsRouter
    .get(
        "",
        paginationAndSortingValidation(BlogSortField),
        inputValidationResultMiddleware,
        blogsController.getBlogList.bind(blogsController)
    )

    .get(
        "/:id",
        idValidator,
        inputValidationResultMiddleware,
        blogsController.getBlog.bind(blogsController)
    )
    .post(
        "",
        superAdminMiddleware,
        blogCreateInputValidation,
        inputValidationResultMiddleware,
        blogsController.createBlog.bind(blogsController)
    )
    .put(
        "/:id",
        superAdminMiddleware,
        idValidator,
        blogUpdateInputValidation,
        inputValidationResultMiddleware,
        blogsController.updateBlog.bind(blogsController)
    )
    .delete(
        "/:id",
        superAdminMiddleware,
        idValidator,
        inputValidationResultMiddleware,
        blogsController.deleteBlog.bind(blogsController)
    )
    .get(
        "/:id/posts",
        idValidator,
        blogExistingIdValidationMiddleware,
        paginationAndSortingValidation(PostSortField),
        inputValidationResultMiddleware,
        blogsController.getBlogPostList.bind(blogsController)
    )
    .post(
        "/:id/posts",
        superAdminMiddleware,
        idValidator,
        blogExistingIdValidationMiddleware,
        postCreateForBlogInputValidation,
        inputValidationResultMiddleware,
        blogsController.createBlogPost.bind(blogsController)
    )
