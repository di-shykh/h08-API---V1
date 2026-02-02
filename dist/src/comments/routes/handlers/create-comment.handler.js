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
exports.createCommentHandler = createCommentHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const comment_services_1 = require("../../application/comment.services");
const result_code_1 = require("../../../core/result/result.code");
const resultCodeToHttpExeptions_1 = require("../../../core/result/resultCodeToHttpExeptions");
const http_statuses_1 = require("../../../core/types/http-statuses");
const posts_query_repository_1 = require("../../../posts/repositories/posts.query-repository");
function createCommentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postId = req.params.id;
            const post = yield posts_query_repository_1.postsQueryRepository.findPostByIdOrFail(postId);
            const commentInput = req.body;
            const userId = req.userId;
            const result = yield comment_services_1.commentsService.createComment(postId, userId, commentInput);
            if (result.status !== result_code_1.ResultStatus.Created) {
                res.status((0, resultCodeToHttpExeptions_1.resultCodeToHttpException)(result.status)).json({
                    errorsMessages: result.extensions
                });
                return;
            }
            res.status(http_statuses_1.HttpStatus.Created).json(result.data);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=create-comment.handler.js.map