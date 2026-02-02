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
exports.getBlogListHandler = getBlogListHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_handler_1 = require("../../../core/errors/error.handler");
const set_default_sort_and_pagination_1 = require("../../../core/helpers/set-default-sort-and-pagination");
const express_validator_1 = require("express-validator");
const blogs_query_repository_1 = require("../../repositories/blogs.query-repository");
function getBlogListHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query;
            const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
                locations: ['query'],
                includeOptionals: true,
            }); //утилита для извечения трансформированных значений после валидатара
            //в req.query остаются сырые квери параметры (строки)
            const queryInput = (0, set_default_sort_and_pagination_1.setDefaultSortAndPaginationIfNotExist)(Object.assign(Object.assign({}, query), sanitizedQuery));
            const { items, totalCount } = yield blogs_query_repository_1.blogsQueryRepository.findManyBlogs(queryInput);
            const blogsListOutput = blogs_query_repository_1.blogsQueryRepository.mapToBlogListPaginatedOutput(items, queryInput.pageNumber, queryInput.pageSize, totalCount);
            res.status(http_statuses_1.HttpStatus.Ok).send(blogsListOutput);
        }
        catch (error) {
            (0, error_handler_1.errorHandler)(error, res);
        }
    });
}
//# sourceMappingURL=get-blog-list.handler.js.map