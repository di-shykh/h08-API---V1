"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCreateForBlogInputValidation = exports.postUpdateInputValidation = exports.postCreateInputValidation = void 0;
const express_validator_1 = require("express-validator");
const blogs_query_repository_1 = require("../../blogs/repositories/blogs.query-repository");
const titleValidation = (0, express_validator_1.body)("title")
    .exists().withMessage("Title is required")
    .isString().withMessage("Title should be string")
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("Title should be min 2 characters long max 30");
const shortDescriptionValidation = (0, express_validator_1.body)("shortDescription")
    .exists().withMessage("shortDescription is required")
    .isString().withMessage("shortDescription should be string")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("shortDescription should be min 2 characters long max 100");
const contentValidation = (0, express_validator_1.body)("content")
    .exists().withMessage("content is required")
    .isString().withMessage("content should be string")
    .trim()
    .isLength({ min: 2, max: 1000 }).withMessage("content should be min 2 characters long max 1000");
const blogIdValidation = (0, express_validator_1.body)("blogId")
    .exists().withMessage("blogId is required")
    .isString().withMessage("blogId should be string")
    .trim()
    .custom((id) => __awaiter(void 0, void 0, void 0, function* () {
    const blog = yield blogs_query_repository_1.blogsQueryRepository.findBlogById(id);
    if (!blog) {
        throw new Error("blogId does not exist");
    }
    return true;
}));
const createdAtValidation = (0, express_validator_1.body)('createdAt')
    .exists().withMessage("createdAt is required")
    .isString().withMessage("createdAt should be string")
    .isISO8601({
    strict: true, // Строгая проверка
    strictSeparator: true // Требует 'T' как разделитель
}).withMessage("createdAt should be DateTime in ISOString");
exports.postCreateInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
];
exports.postUpdateInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
];
exports.postCreateForBlogInputValidation = [
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
];
//# sourceMappingURL=post.input-dto.validation-middlewares.js.map