"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInputDtoValidation = void 0;
exports.isValidId = isValidId;
exports.isBlogIdExist = isBlogIdExist;
const blogs_query_repository_1 = require("../../blogs/repositories/blogs.query-repository");
const postInputDtoValidation = (data) => {
    const errors = [];
    if (!data.title ||
        typeof data.title !== "string" ||
        data.title.length < 2 ||
        data.title.length > 30) {
        errors.push({ field: "title", message: "Title is required" });
    }
    if (!data.shortDescription ||
        typeof data.shortDescription !== "string" ||
        data.shortDescription.length < 2 ||
        data.shortDescription.length > 100) {
        errors.push({ field: "shortDescription", message: "ShortDescription is required" });
    }
    if (!data.content ||
        typeof data.content !== "string" ||
        data.content.length < 2 ||
        data.content.length > 1000) {
        errors.push({ field: "content", message: "Content is required" });
    }
    if (!data.blogId ||
        typeof data.blogId !== "string" ||
        !isValidId(data.blogId) ||
        !isBlogIdExist(data.blogId)) {
        errors.push({ field: "blogId", message: "Invalid blogId" });
    }
    return errors;
};
exports.postInputDtoValidation = postInputDtoValidation;
//возможно не нужна
function isValidId(id) {
    const idInt = parseInt(id);
    if (idInt < 0 || isNaN(idInt)) {
        return false;
    }
    return true;
}
function isBlogIdExist(blogId) {
    const blog = blogs_query_repository_1.blogsQueryRepository.findBlogById(blogId);
    return !!blog;
}
//# sourceMappingURL=postInputDtoValidation.js.map