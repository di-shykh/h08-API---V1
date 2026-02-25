import 'reflect-metadata';
import {Router} from "express";
import {
    emailValidation,
    loginOrEmailValidation, newPasswordValidation,
    passwordValidation,
    userCreateValidation
} from "../../users/routes/user.input-dto.validation-middleware";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validation.result.middleware";
import {AccessTokenGuard} from "../middlewares/access.token.guard";
import {codeConfirmationValidation} from "../middlewares/validation/registration.input-validation";
import {rateLimitGuard} from "../middlewares/rate-limiting.middleware";
import {RefreshTokenGuard} from "../middlewares/refresh.token.guard"
import {recoveryCodeValidation} from "../middlewares/validation/password-recovery-code.validation";
import {container} from "../../inversify-ioc";
import {AuthController} from "./auth.controller";

const authController = container.get(AuthController);
export const authRouter: Router = Router({});

authRouter
    .post(
    "/login",
        rateLimitGuard,
        passwordValidation,
        loginOrEmailValidation,
        inputValidationResultMiddleware,
        authController.login.bind(authController)
    )
    .get(
        "/me",
        AccessTokenGuard,
        authController.me.bind(authController)
    )
    .post(
        "/registration",
        rateLimitGuard,
        userCreateValidation,
        inputValidationResultMiddleware,
        authController.registration.bind(authController)
    )
    .post(
        "/registration-confirmation",
        rateLimitGuard,
        codeConfirmationValidation,
        inputValidationResultMiddleware,
        authController.registrationConfirmation.bind(authController)
    )
    .post(
        "/registration-email-resending",
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        authController.registrationEmailResending.bind(authController)
    )
    .post(
        "/refresh-token",
        RefreshTokenGuard,
        authController.refreshToken.bind(authController)
    )
    .post(
        "/logout",
        RefreshTokenGuard,
        authController.logout.bind(authController)
    )
    .post(
        "/password-recovery",
        rateLimitGuard,
        emailValidation,
        inputValidationResultMiddleware,
        authController.passwordRecovery.bind(authController)
    )
    .post(
        "/new-password",
        rateLimitGuard,
        newPasswordValidation,
        recoveryCodeValidation,
        inputValidationResultMiddleware,
        authController.newPassword.bind(authController)
    )