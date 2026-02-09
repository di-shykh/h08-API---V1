import {Router} from "express";
import {
    emailValidation,
    loginOrEmailValidation,
    passwordValidation,
    userCreateValidation
} from "../../users/routes/user.input-dto.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {AccessTokenGuard} from "../middlewares/access.token.guard";
import {codeConfirmationValidation} from "../middlewares/validation/registration.input-validation";
import {rateLimitGuard} from "../middlewares/rate-limiting.middleware";
import {RefreshTokenGuard} from "../middlewares/refresh.token.guard"
import {AuthController} from "./auth.controller";


export const authRouter: Router = Router({});

authRouter
    .post(
    "/login",
        rateLimitGuard,
        passwordValidation,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        AuthController.login
    )
    .get(
        "/me",
        AccessTokenGuard,
        AuthController.me
    )
    .post(
        "/registration",
        rateLimitGuard,
        userCreateValidation,
        inputValidationResultMiddleware,
        AuthController.registration
    )
    .post(
        "/registration-confirmation",
        rateLimitGuard,
        codeConfirmationValidation,
        inputValidationResultMiddleware,
        AuthController.registrationConfirmation
    )
    .post(
        "/registration-email-resending",
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        AuthController.registrationEmailResending
    )
    .post(
        "/refresh-token",
        RefreshTokenGuard,
        AuthController.refreshToken
    )
    .post(
        "/logout",
        RefreshTokenGuard,
        AuthController.logout
    )