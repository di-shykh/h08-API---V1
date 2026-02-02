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
exports.getUserHandler = getUserHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_handler_1 = require("../../../core/errors/error.handler");
const user_query_repository_1 = require("../../repositories/user.query-repository");
function getUserHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const user = yield user_query_repository_1.usersQueryRepository.findUserByIdOrFail(id);
            const userOutput = user_query_repository_1.usersQueryRepository.mapToUserOutput(user);
            res.status(http_statuses_1.HttpStatus.Ok).send(userOutput);
        }
        catch (err) {
            (0, error_handler_1.errorHandler)(err, res);
        }
    });
}
//# sourceMappingURL=get-user.handler.js.map