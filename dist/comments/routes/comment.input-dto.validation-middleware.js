"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentInputValidation = void 0;
const express_validator_1 = require("express-validator");
const contentValidation = (0, express_validator_1.body)('content')
    .exists().withMessage('content is required')
    .isString().withMessage('content must be a string')
    .trim()
    .notEmpty().withMessage('content is required')
    .isLength({ min: 20, max: 300 }).withMessage('content must be at least 20 characters and max 300');
exports.commentInputValidation = [
    contentValidation,
];
//# sourceMappingURL=comment.input-dto.validation-middleware.js.map