import {Router} from "express";
import {
    emailValidation,
    loginOrEmailValidation,
    passwordValidation,
    userCreateValidation
} from "../../users/routes/user.input-dto.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {authHandler} from "./handlers/auth.handler";
import {AccessTokenGuard} from "../middlewares/access.token.guard";
import {authGetHandler} from "./handlers/auth.get-user.handler";
import {registrationHandler} from "./handlers/registration.handler";
import {registrationConfirmationHandler} from "./handlers/registration-confimation.handler";
import {codeConfirmationValidation} from "../middlewares/validation/registration.input-validation";
import {registrationEmailResendingHandler} from "./handlers/registration-email-resending.handler";
import {globalLimiter} from "../middlewares/rate-limiting.middleware";
import rateLimit from "express-rate-limit";
import {refreshTokenHandler} from "./handlers/refresh-token.handler";
import {RefereshTokenGuard} from "../middlewares/refresh.token.guard"

// Проверяем, работаем ли в тестовом окружении
const isTest = process.env.NODE_ENV === 'test';

// Пустой middleware для тестов
const skipMiddleware = (req: any, res: any, next: any) => next();

// Фабрика для rate limiters
const createRateLimiter = (options: any) => {
    if (isTest) return skipMiddleware;
    return rateLimit(options);
};

export const authRouter: Router = Router({});

// Глобальный лимитер только для не-тестов
if (!isTest) {
    authRouter.use(globalLimiter);
}

let RefereshTokenGuard;
authRouter
    .post(
    "/login",
        passwordValidation,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        authHandler
    )
    .get(
        "/me",
        AccessTokenGuard,
        authGetHandler
    )
    .post(
        "/registration",
        createRateLimiter({
            windowMs: 15 * 60 * 1000,
            max: 10,
            message: {
                error: 'To many attempts. Try again 15 minutes later'
            }
        }),
        userCreateValidation,
        inputValidationResultMiddleware,
        registrationHandler)
    .post(
        "/registration-confirmation",
        createRateLimiter({
            windowMs: 60 * 60 * 1000,
            max: 10,
            message: {
                error: 'To many attempts. Try again later'
            }
        }),
        codeConfirmationValidation,
        inputValidationResultMiddleware,
        registrationConfirmationHandler
    )
    .post(
        "/registration-email-resending",
        createRateLimiter({
            windowMs: 60 * 60 * 1000,
            max: 5,
            message: {
                error: 'To many attempts. Try again later'
            }
        }),
        emailValidation,
        inputValidationResultMiddleware,
        registrationEmailResendingHandler
    )
    .post(
        "/refresh-token",
        RefereshTokenGuard,
        refreshTokenHandler
    )