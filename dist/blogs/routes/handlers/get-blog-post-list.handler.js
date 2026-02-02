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
exports.getBlogPostListHandler = getBlogPostListHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const http_statuses_1 = require("../../../core/types/http-statuses");
const express_validator_1 = require("express-validator");
const posts_query_repository_1 = require("../../../posts/repositories/posts.query-repository");
function getBlogPostListHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const blogId = req.params.id;
            const queryInput = req.query;
            const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const { items, totalCount } = yield posts_query_repository_1.postsQueryRepository.findPostsByBlogId(blogId, sanitizedQuery);
            const postListOutput = posts_query_repository_1.postsQueryRepository.mapToPostListPaginatedOutput(items, sanitizedQuery.pageNumber, sanitizedQuery.pageSize, totalCount);
            res.status(http_statuses_1.HttpStatus.Ok).send(postListOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-blog-post-list.handler.js.map