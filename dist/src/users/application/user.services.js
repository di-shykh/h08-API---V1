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
exports.usersService = void 0;
const user_query_repository_1 = require("../repositories/user.query-repository");
const bcrypt_service_1 = require("../../auth/adapters/bcrypt.service");
const user_repository_1 = require("../repositories/user.repository");
const duplicateField_error_1 = require("../../core/errors/duplicateField.error");
exports.usersService = {
    createUser(userInputDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { login, email, password } = userInputDto;
            const isLoginUnique = yield user_query_repository_1.usersQueryRepository.isLoginUnique(login);
            if (!isLoginUnique) {
                throw new duplicateField_error_1.DuplicateFieldError("login");
            }
            const isEmailUnique = yield user_query_repository_1.usersQueryRepository.isEmailUnique(email);
            if (!isEmailUnique) {
                throw new duplicateField_error_1.DuplicateFieldError("email");
            }
            const passwordHash = yield bcrypt_service_1.bcryptService.generateHash(password);
            const newUser = {
                login,
                email,
                passwordHash,
                createdAt: new Date().toISOString(),
            };
            const newUserId = yield user_repository_1.usersRepository.createUser(newUser);
            return newUserId;
        });
    },
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user_repository_1.usersRepository.deleteUser(id);
        });
    }
};
//# sourceMappingURL=user.services.js.map