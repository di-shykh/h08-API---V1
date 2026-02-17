import {body} from "express-validator";

const loginValidation = body("login")
    .exists().withMessage('Login is required')
    .isString().withMessage('Login should be string')
    .trim()
    .notEmpty()
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Login can only contain letters, numbers, underscores and hyphens')
    .isLength({min: 3, max: 10})
    .withMessage('Login must be between 3 and 30 characters');
export const passwordValidation = body("password")
    .exists().withMessage('Passwords is required')
    .isString().withMessage('Passwords should be string')
    .trim()
    .notEmpty()
    .isLength({min: 6, max: 20})
    .withMessage('Password must be between 6 and 20 characters');
export const newPasswordValidation = body("newPassword")
    .exists().withMessage('Passwords is required')
    .isString().withMessage('Passwords should be string')
    .trim()
    .notEmpty()
    .isLength({min: 6, max: 20})
    .withMessage('Password must be between 6 and 20 characters');
export const emailValidation = body("email")
    .exists().withMessage('Email is required')
    .isString().withMessage('Email should be string')
    .trim()
    .notEmpty()
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Invalid email address')
    .isEmail().withMessage('Invalid email address');
export const loginOrEmailValidation = body("loginOrEmail")
    .exists().withMessage('Login or email is required')
    .isString()
    .trim()
    .isLength({min: 1, max: 500})
    .withMessage("loginOrEmail is not correct");
export const userCreateValidation = [
    loginValidation,
    passwordValidation,
    emailValidation,
];

