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
exports.getBlogHandler = getBlogHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const error_handler_1 = require("../../../core/errors/error.handler");
const blogs_query_repository_1 = require("../../repositories/blogs.query-repository");
function getBlogHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const blog = yield blogs_query_repository_1.blogsQueryRepository.findBlogByIdOrFail(id);
            const blogOutput = blogs_query_repository_1.blogsQueryRepository.mapToBlogOutput(blog);
            res.status(http_statuses_1.HttpStatus.Ok).send(blogOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-blog.handler.js.map