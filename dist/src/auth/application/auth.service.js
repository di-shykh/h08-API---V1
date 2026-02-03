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
exports.authService = void 0;
const user_repository_1 = require("../../users/repositories/user.repository");
const bcrypt_service_1 = require("../adapters/bcrypt.service");
const jwt_service_1 = require("./jwt.service");
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const user_query_repository_1 = require("../../users/repositories/user.query-repository");
const email_adapter_1 = require("../adapters/email.adapter");
const result_type_1 = require("../../core/result/result.type");
const normolize_email_1 = require("../../core/helpers/normolize-email");
const session_repository_1 = require("../../securityDevices/repositories/session.repository");
exports.authService = {
    loginUser(loginOrEmail, password, deviceName, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_query_repository_1.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
            if (!user)
                return null;
            const result = yield bcrypt_service_1.bcryptService.checkPassword(password, user.passwordHash);
            if (!result)
                return null;
            const deviceId = (0, uuid_1.v4)();
            const userId = user._id.toString();
            const { accessToken, refreshToken } = yield jwt_service_1.jwtService.createToken(user._id.toString(), deviceId);
            const payload = jwt_service_1.jwtService.verifyTokenFull(refreshToken);
            if (!payload) {
                return null;
            }
            if (!payload.iat) {
                return null;
            }
            const iat = payload.iat || Math.floor(Date.now() / 1000);
            const session = {
                userId,
                deviceId,
                deviceName,
                ipAddress,
                iat: new Date(iat * 1000),
                exp: new Date(Date.now() + 20000),
            };
            const sessionId = yield session_repository_1.sessionRepository.createSession(session);
            if (!sessionId)
                return null;
            return { accessToken, refreshToken };
        });
    },
    createUser(userInputDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { login, email, password } = userInputDto;
            const normalizedEmail = (0, normolize_email_1.normalizeEmail)(email);
            const isLoginUnique = yield user_query_repository_1.usersQueryRepository.isLoginUnique(login);
            if (!isLoginUnique) {
                return result_type_1.ResultObject.BadRequest('login', 'Login already exists');
            }
            const isEmailUnique = yield user_query_repository_1.usersQueryRepository.isEmailUnique(normalizedEmail);
            if (!isEmailUnique) {
                return result_type_1.ResultObject.BadRequest('email', 'Email already exists');
            }
            const passwordHash = yield bcrypt_service_1.bcryptService.generateHash(password);
            const confirmationCode = (0, uuid_1.v4)();
            const expirationDate = (0, date_fns_1.addHours)(new Date(), 24).toISOString();
            const newUser = {
                login,
                email: normalizedEmail,
                passwordHash,
                createdAt: new Date().toISOString(),
                emailConfirmation: {
                    isConfirmed: false,
                    confirmationCode: confirmationCode,
                    expirationDate: expirationDate,
                }
            };
            const newUserId = yield user_repository_1.usersRepository.createUser(newUser);
            try {
                yield email_adapter_1.emailAdapter.sendConfirmationEmail(email, confirmationCode);
                return result_type_1.ResultObject.Success(newUserId);
            }
            catch (err) {
                yield user_repository_1.usersRepository.deleteUser(newUserId);
                return result_type_1.ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
            }
        });
    },
    confirmUserRegistration(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!code || code.length !== 36) { // UUID v4 имеет 36 символов
                return result_type_1.ResultObject.BadRequest('code', 'Invalid confirmation code format');
            }
            const user = yield user_query_repository_1.usersQueryRepository.findByConfirmationCode(code);
            if (!user || !user.emailConfirmation) {
                return result_type_1.ResultObject.BadRequest('code', 'Code does not exist');
            }
            if (user.emailConfirmation.isConfirmed) {
                return result_type_1.ResultObject.BadRequest('code', 'Registration is already confirmed');
            }
            const dateNow = new Date();
            const expirationDate = new Date(user.emailConfirmation.expirationDate);
            if ((0, date_fns_1.isAfter)(dateNow, expirationDate)) {
                return result_type_1.ResultObject.BadRequest('code', 'Code expired');
            }
            const result = yield user_repository_1.usersRepository.confirmEmail(code);
            if (!result) {
                return result_type_1.ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
            }
            return result_type_1.ResultObject.Success(result);
        });
    },
    resendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const user = yield user_query_repository_1.usersQueryRepository.findUserByEmail(email);
            if (!user || !user.emailConfirmation) {
                return result_type_1.ResultObject.BadRequest('email', 'User with this email is not exists');
            }
            if ((_a = user.emailConfirmation) === null || _a === void 0 ? void 0 : _a.isConfirmed) {
                return result_type_1.ResultObject.BadRequest('email', 'Email is already confirmed');
            }
            const confirmationCode = (0, uuid_1.v4)();
            const expirationDate = (0, date_fns_1.addHours)(new Date(), 24).toISOString();
            try {
                yield email_adapter_1.emailAdapter.resendEmail(email, confirmationCode);
                const result = yield user_repository_1.usersRepository.updateUserEmailConfirmation(user._id, confirmationCode, expirationDate);
                return result_type_1.ResultObject.Success(result);
            }
            catch (e) {
                return result_type_1.ResultObject.BadRequest('email', 'Email wasn\'t confirmed');
            }
        });
    },
};
//# sourceMappingURL=auth.service.js.map