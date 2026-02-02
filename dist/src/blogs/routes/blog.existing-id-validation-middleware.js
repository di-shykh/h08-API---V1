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
exports.blogExistingIdValidationMiddleware = void 0;
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
const error_handler_1 = require("../../core/errors/error.handler");
const mongodb_1 = require("mongodb");
const blogs_query_repository_1 = require("../repositories/blogs.query-repository");
function isValidObjectId(id) {
    try {
        const objectId = new mongodb_1.ObjectId(id);
        return objectId.toString() === id;
    }
    catch (err) {
        return false;
    }
}
const blogExistingIdValidationMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (id) {
            if (isValidObjectId(id)) {
                const blog = yield blogs_query_repository_1.blogsQueryRepository.findBlogByIdOrFail(id);
                if (!blog) {
                    console.log("error blogWithIdExistsValidation in if");
                    throw new repository_not_found_error_1.RepositoryNotFoundError(`Blog with id ${id} not found`);
                }
            }
        }
        next();
    }
    catch (error) {
        (0, error_handler_1.errorHandler)(error, res);
    }
});
exports.blogExistingIdValidationMiddleware = blogExistingIdValidationMiddleware;
//# sourceMappingURL=blog.existing-id-validation-middleware.js.map