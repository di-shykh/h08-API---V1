import {body} from 'express-validator';

const recoveryValidation = body('recoveryCode')
    .exists().withMessage('Code is required')
    .isString().withMessage('Code should be string')
    .trim()
    .notEmpty().withMessage('Code cannot be empty')
    .isUUID().withMessage('Code should be a valid UUID');

export const recoveryCodeValidation = [
    recoveryValidation,
]