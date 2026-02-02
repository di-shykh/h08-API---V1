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
exports.deleteUserHandler = deleteUserHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const user_services_1 = require("../../application/user.services");
const http_statuses_1 = require("../../../core/types/http-statuses");
function deleteUserHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const deletedUser = yield user_services_1.usersService.deleteUser(id);
            res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=delete-user.handler.js.map