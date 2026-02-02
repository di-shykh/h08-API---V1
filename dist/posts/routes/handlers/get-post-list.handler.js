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
exports.getPostListHandler = getPostListHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const express_validator_1 = require("express-validator");
const set_default_sort_and_pagination_1 = require("../../../core/helpers/set-default-sort-and-pagination");
const error_handler_1 = require("../../../core/errors/error.handler");
const posts_query_repository_1 = require("../../repositories/posts.query-repository");
function getPostListHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query;
            const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const queryInput = (0, set_default_sort_and_pagination_1.setDefaultSortAndPaginationIfNotExist)(sanitizedQuery);
            const { items, totalCount } = yield posts_query_repository_1.postsQueryRepository.findManyPosts(queryInput);
            const postsListOutput = posts_query_repository_1.postsQueryRepository.mapToPostListPaginatedOutput(items, queryInput.pageNumber, queryInput.pageSize, totalCount);
            res.status(http_statuses_1.HttpStatus.Ok).send(postsListOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-post-list.handler.js.map