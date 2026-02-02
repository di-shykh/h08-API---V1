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
exports.createPostHandler = createPostHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const post_services_1 = require("../../application/post.services");
const error_handler_1 = require("../../../core/errors/error.handler");
const posts_query_repository_1 = require("../../repositories/posts.query-repository");
function createPostHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const createdPost = yield post_services_1.postsService.createPost(req.body);
            const insertedPost = yield posts_query_repository_1.postsQueryRepository.findPostByIdOrFail(createdPost);
            const postOutput = posts_query_repository_1.postsQueryRepository.mapToPostOutput(insertedPost);
            res.status(http_statuses_1.HttpStatus.Created).send(postOutput);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=create-post.handler.js.map