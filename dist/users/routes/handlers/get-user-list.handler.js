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
exports.getUserListHandler = getUserListHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const set_default_sort_and_pagination_1 = require("../../../core/helpers/set-default-sort-and-pagination");
const express_validator_1 = require("express-validator");
const http_statuses_1 = require("../../../core/types/http-statuses");
const user_query_repository_1 = require("../../repositories/user.query-repository");
function getUserListHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = req.query;
            const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const queryInput = (0, set_default_sort_and_pagination_1.setDefaultSortAndPaginationIfNotExist)(sanitizedQuery);
            const { items, totalCount } = yield user_query_repository_1.usersQueryRepository.findManyUsers(queryInput);
            const userListOutput = user_query_repository_1.usersQueryRepository.mapToUserListPaginatedOutput(items, queryInput.pageNumber, queryInput.pageSize, totalCount);
            res.status(http_statuses_1.HttpStatus.Ok).send(userListOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-user-list.handler.js.map