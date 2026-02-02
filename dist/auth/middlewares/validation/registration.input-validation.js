"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeConfirmationValidation = void 0;
const express_validator_1 = require("express-validator");
const codeValidation = (0, express_validator_1.body)('code')
    .exists().withMessage('Code is required')
    .isString().withMessage('Code should be string')
    .trim()
    .notEmpty().withMessage('Code cannot be empty')
    .isUUID().withMessage('Code should be a valid UUID');
exports.codeConfirmationValidation = [
    codeValidation,
];
//# sourceMappingURL=registration.input-validation.js.map