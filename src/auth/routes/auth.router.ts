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
import {authController} from "../../composition.root"
export const authRouter: Router = Router({});

authRouter
    .post(
    "/login",
        rateLimitGuard,
        passwordValidation,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        authController.login
    )
    .get(
        "/me",
        AccessTokenGuard,
        authController.me
    )
    .post(
        "/registration",
        rateLimitGuard,
        userCreateValidation,
        inputValidationResultMiddleware,
        authController.registration
    )
    .post(
        "/registration-confirmation",
        rateLimitGuard,
        codeConfirmationValidation,
        inputValidationResultMiddleware,
        authController.registrationConfirmation
    )
    .post(
        "/registration-email-resending",
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        authController.registrationEmailResending
    )
    .post(
        "/refresh-token",
        RefreshTokenGuard,
        authController.refreshToken
    )
    .post(
        "/logout",
        RefreshTokenGuard,
        authController.logout
    )