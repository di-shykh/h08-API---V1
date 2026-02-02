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
exports.blogWithIdExistsValidation = exports.idValidator = void 0;
const express_validator_1 = require("express-validator");
const repository_not_found_error_1 = require("../../errors/repository-not-found.error");
const blogs_query_repository_1 = require("../../../blogs/repositories/blogs.query-repository");
exports.idValidator = (0, express_validator_1.param)("id")
    .exists().withMessage('id is required')
    .isString().withMessage('id must be a string')
    .isLength({ min: 1 }).withMessage('id must be not empty')
    .isMongoId().withMessage('Incorrect format of ObjectId');
exports.blogWithIdExistsValidation = (0, express_validator_1.param)("id")
    .exists().withMessage('Id is required')
    .custom((id_1, _a) => __awaiter(void 0, [id_1, _a], void 0, function* (id, { req }) {
    if (id) {
        try {
            const blog = yield blogs_query_repository_1.blogsQueryRepository.findBlogByIdOrFail(id);
            if (!blog) {
                console.log("error blogWithIdExistsValidation in if");
                throw new repository_not_found_error_1.RepositoryNotFoundError(`Blog with id ${id} not found`);
            }
            return true;
        }
        catch (error) {
            console.log("error blogWithIdExistsValidation", error);
            req.sendStatus(404);
            throw error;
        }
    }
    return false;
}));
//# sourceMappingURL=params-id.validation-middleware.js.map