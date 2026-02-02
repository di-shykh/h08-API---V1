"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsService = void 0;
const posts_query_repository_1 = require("../../posts/repositories/posts.query-repository");
const result_code_1 = require("../../core/result/result.code");
const result_type_1 = require("../../core/result/result.type");
const comments_repository_1 = require("../repositories/comments.repository");
const comments_query_repository_1 = require("../repositories/comments.query-repository");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.commentsService = {
    createComment(postId, userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            let post;
            try {
                post = yield posts_query_repository_1.postsQueryRepository.findPostByIdOrFail(postId);
            }
            catch (error) {
                // Если выброшено RepositoryNotFoundError - пост не найден
                if (error instanceof repository_not_found_error_1.RepositoryNotFoundError) {
                    return result_type_1.ResultObject.NotFound('postId', 'Post with this Id is not exist');
                }
                // Другие ошибки
                console.error('Error finding post:', error);
                return result_type_1.ResultObject.InternalServerError('Error finding post');
            }
            if (!post) {
                return result_type_1.ResultObject.NotFound('postId', 'Post with this Id is not exist');
            }
            const newComment = {
                content: dto.content,
                userId,
                postId,
                createdAt: new Date().toISOString(),
            };
            const createdCommentId = yield comments_repository_1.commentsRepository.createComment(newComment);
            const createdComment = yield comments_query_repository_1.commentsQueryRepository.findCommentById(createdCommentId);
            const createdCommentOutput = yield comments_query_repository_1.commentsQueryRepository.mapToCommentOutput(createdComment);
            return result_type_1.ResultObject.Created(createdCommentOutput);
        });
    },
    updateComment(commentId, userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkResult = yield this.checkUserId(userId, commentId);
            if (checkResult.status === result_code_1.ResultStatus.Forbidden || checkResult.status === result_code_1.ResultStatus.NotFound) {
                return checkResult;
            }
            const result = yield comments_repository_1.commentsRepository.updateComment(commentId, dto);
            if (result.matchedCount < 1) {
                return result_type_1.ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
            }
            return result_type_1.ResultObject.NoContent();
        });
    },
    deleteComment(userId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkResult = yield this.checkUserId(userId, commentId);
            if (checkResult.status === result_code_1.ResultStatus.Forbidden || checkResult.status === result_code_1.ResultStatus.NotFound) {
                return checkResult;
            }
            const result = yield comments_repository_1.commentsRepository.deleteComment(commentId);
            if (result.deletedCount < 1) {
                return result_type_1.ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
            }
            return result_type_1.ResultObject.NoContent();
        });
    },
    checkUserId(userId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield comments_query_repository_1.commentsQueryRepository.findCommentById(commentId);
            if (!comment) {
                return result_type_1.ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
            }
            if (comment.userId !== userId) {
                return result_type_1.ResultObject.Forbidden();
            }
            return result_type_1.ResultObject.Success(null);
        });
    }
};
//# sourceMappingURL=comment.services.js.map