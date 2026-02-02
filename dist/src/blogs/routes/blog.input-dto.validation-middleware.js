"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogUpdateInputValidation = exports.blogCreateInputValidation = void 0;
const express_validator_1 = require("express-validator");
const URL_PATTERN = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
const nameValidation = (0, express_validator_1.body)("name")
    .exists().withMessage("name is required")
    .isString().withMessage("name should  be string")
    .trim()
    .isLength({ min: 2, max: 15 }).withMessage("name must be at least 2 characters and max 15");
const descriptionValidation = (0, express_validator_1.body)("description")
    .exists().withMessage("description is required")
    .isString().withMessage("description should  be string")
    .trim()
    .isLength({ min: 2, max: 500 }).withMessage("description must be at least 2 characters and max 500");
const websiteUrlValidation = (0, express_validator_1.body)("websiteUrl")
    .exists().withMessage("websiteUrl is required")
    .isString().withMessage("websiteUrl should  be string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("websiteUrl must be at least 5 characters and max 100")
    .custom((value) => {
    if (!URL_PATTERN.test(value)) {
        throw new Error(`URL must be a valid HTTPS URL`);
    }
    return true;
});
const createdAtValidation = (0, express_validator_1.body)('createdAt')
    .exists().withMessage("createdAt is required")
    .isString().withMessage("createdAt should be string")
    .isISO8601({
    strict: true, // Строгая проверка
    strictSeparator: true // Требует 'T' как разделитель
}).withMessage("createdAt should be DateTime in ISOString");
const isMembershipValidation = (0, express_validator_1.body)("isMembership")
    .exists().withMessage("isMembership required")
    .isBoolean().withMessage("isMembership should be boolean");
exports.blogCreateInputValidation = [
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
];
exports.blogUpdateInputValidation = [
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
];
//# sourceMappingURL=blog.input-dto.validation-middleware.js.map