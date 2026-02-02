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
exports.createUserHandler = createUserHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const http_statuses_1 = require("../../../core/types/http-statuses");
const user_query_repository_1 = require("../../repositories/user.query-repository");
const user_services_1 = require("../../application/user.services");
function createUserHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const createdUser = yield user_services_1.usersService.createUser(req.body);
            const insertedUser = yield user_query_repository_1.usersQueryRepository.findUserByIdOrFail(createdUser);
            const userOutput = user_query_repository_1.usersQueryRepository.mapToUserOutput(insertedUser);
            res.status(http_statuses_1.HttpStatus.Created).send(userOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=create-user.handler.js.map