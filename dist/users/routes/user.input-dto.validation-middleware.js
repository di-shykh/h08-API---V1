"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCreateValidation = exports.loginOrEmailValidation = exports.emailValidation = exports.passwordValidation = void 0;
const express_validator_1 = require("express-validator");
const loginValidation = (0, express_validator_1.body)("login")
    .exists().withMessage('Login is required')
    .isString().withMessage('Login should be string')
    .trim()
    .notEmpty()
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Login can only contain letters, numbers, underscores and hyphens')
    .isLength({ min: 3, max: 10 })
    .withMessage('Login must be between 3 and 30 characters');
exports.passwordValidation = (0, express_validator_1.body)("password")
    .exists().withMessage('Passwords is required')
    .isString().withMessage('Passwords should be string')
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be between 6 and 20 characters');
exports.emailValidation = (0, express_validator_1.body)("email")
    .exists().withMessage('Email is required')
    .isString().withMessage('Email should be string')
    .trim()
    .notEmpty()
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Invalid email address')
    .isEmail().withMessage('Invalid email address');
exports.loginOrEmailValidation = (0, express_validator_1.body)("loginOrEmail")
    .exists().withMessage('Login or email is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("loginOrEmail is not correct");
exports.userCreateValidation = [
    loginValidation,
    exports.passwordValidation,
    exports.emailValidation,
];
//# sourceMappingURL=user.input-dto.validation-middleware.js.map