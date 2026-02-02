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
exports.getCommentListHandler = getCommentListHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const express_validator_1 = require("express-validator");
const set_default_sort_and_pagination_1 = require("../../../core/helpers/set-default-sort-and-pagination");
const comments_query_repository_1 = require("../../repositories/comments.query-repository");
const result_type_1 = require("../../../core/result/result.type");
const http_statuses_1 = require("../../../core/types/http-statuses");
const posts_query_repository_1 = require("../../../posts/repositories/posts.query-repository");
function getCommentListHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id: paramPostId } = req.params;
            if (!paramPostId) {
                return res.status(http_statuses_1.HttpStatus.BadRequest).json({
                    errorsMessages: [{ message: "Post ID is required", field: "id" }]
                });
            }
            const post = yield posts_query_repository_1.postsQueryRepository.findPostByIdOrFail(paramPostId);
            if (!post) {
                return res.status(http_statuses_1.HttpStatus.NotFound).json({
                    errorsMessages: [{ message: "Post not found", field: "id" }]
                });
            }
            const query = req.query;
            const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const postId = paramPostId; /*|| sanitizedQuery.postId;*/
            const queryInput = (0, set_default_sort_and_pagination_1.setDefaultSortAndPaginationIfNotExist)(Object.assign({}, sanitizedQuery));
            // Проверяем, что pageSize и pageNumber из query используются
            console.log('Query params received:', query);
            console.log('Sanitized query:', sanitizedQuery);
            console.log('Query input after processing:', queryInput);
            const { items, totalCount } = yield comments_query_repository_1.commentsQueryRepository.findManyComments(queryInput, postId);
            const commentsListOutput = yield comments_query_repository_1.commentsQueryRepository.mapToCommentListOutput(items, queryInput.pageNumber, queryInput.pageSize, totalCount);
            const result = result_type_1.ResultObject.Success(commentsListOutput);
            res.status(http_statuses_1.HttpStatus.Ok).json(result.data);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-comment-list.handler.js.map