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
import {rateLimitGuard} from "../middlewares/rate-limiting.middleware";
import rateLimit from "express-rate-limit";
import {refreshTokenHandler} from "./handlers/refresh-token.handler";
import {RefreshTokenGuard} from "../middlewares/refresh.token.guard"
import {logoutHandler} from "./handlers/logout.handler";


export const authRouter: Router = Router({});

authRouter
    .post(
    "/login",
        rateLimitGuard,
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
        rateLimitGuard,
        userCreateValidation,
        inputValidationResultMiddleware,
        registrationHandler)
    .post(
        "/registration-confirmation",
        rateLimitGuard,
        codeConfirmationValidation,
        inputValidationResultMiddleware,
        registrationConfirmationHandler
    )
    .post(
        "/registration-email-resending",
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        registrationEmailResendingHandler
    )
    .post(
        "/refresh-token",
        RefreshTokenGuard,
        refreshTokenHandler
    )
    .post(
        "/logout",
        RefreshTokenGuard,
        logoutHandler
    )