"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const user_input_dto_validation_middleware_1 = require("../../users/routes/user.input-dto.validation-middleware");
const input_validation_result_middleware_1 = require("../../core/middlewares/validation/input-validation.result.middleware");
const auth_handler_1 = require("./handlers/auth.handler");
const access_token_guard_1 = require("../middlewares/access.token.guard");
const auth_get_user_handler_1 = require("./handlers/auth.get-user.handler");
const registration_handler_1 = require("./handlers/registration.handler");
const registration_confimation_handler_1 = require("./handlers/registration-confimation.handler");
const registration_input_validation_1 = require("../middlewares/validation/registration.input-validation");
const registration_email_resending_handler_1 = require("./handlers/registration-email-resending.handler");
const rate_limiting_middleware_1 = require("../middlewares/rate-limiting.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const refresh_token_handler_1 = require("./handlers/refresh-token.handler");
const refresh_token_guard_1 = require("../middlewares/refresh.token.guard");
const logout_handler_1 = require("./handlers/logout.handler");
// Проверяем, работаем ли в тестовом окружении
const isTest = process.env.NODE_ENV === 'test';
// Пустой middleware для тестов
const skipMiddleware = (req, res, next) => next();
// Фабрика для rate limiters
const createRateLimiter = (options) => {
    if (isTest)
        return skipMiddleware;
    return (0, express_rate_limit_1.default)(options);
};
exports.authRouter = (0, express_1.Router)({});
// Глобальный лимитер только для не-тестов
if (!isTest) {
    exports.authRouter.use(rate_limiting_middleware_1.globalLimiter);
}
exports.authRouter
    .post("/login", user_input_dto_validation_middleware_1.passwordValidation, user_input_dto_validation_middleware_1.loginOrEmailValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, auth_handler_1.authHandler)
    .get("/me", access_token_guard_1.AccessTokenGuard, auth_get_user_handler_1.authGetHandler)
    .post("/registration", createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'To many attempts. Try again 15 minutes later'
    }
}), user_input_dto_validation_middleware_1.userCreateValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, registration_handler_1.registrationHandler)
    .post("/registration-confirmation", createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: 'To many attempts. Try again later'
    }
}), registration_input_validation_1.codeConfirmationValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, registration_confimation_handler_1.registrationConfirmationHandler)
    .post("/registration-email-resending", createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        error: 'To many attempts. Try again later'
    }
}), user_input_dto_validation_middleware_1.emailValidation, input_validation_result_middleware_1.inputValidationResultMiddleware, registration_email_resending_handler_1.registrationEmailResendingHandler)
    .post("/refresh-token", refresh_token_guard_1.RefereshTokenGuard, refresh_token_handler_1.refreshTokenHandler)
    .post("/logout", refresh_token_guard_1.RefereshTokenGuard, logout_handler_1.logoutHandler);
//# sourceMappingURL=auth.router.js.map