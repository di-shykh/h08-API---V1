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
exports.getCommentHandler = getCommentHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const comments_query_repository_1 = require("../../repositories/comments.query-repository");
const result_type_1 = require("../../../core/result/result.type");
const resultCodeToHttpExeptions_1 = require("../../../core/result/resultCodeToHttpExeptions");
const http_statuses_1 = require("../../../core/types/http-statuses");
function getCommentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const comment = yield comments_query_repository_1.commentsQueryRepository.findCommentById(id);
            if (!comment) {
                const result = result_type_1.ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
                res.status((0, resultCodeToHttpExeptions_1.resultCodeToHttpException)(result.status)).json({
                    errorsMesages: result.extensions
                });
                return;
            }
            const commentOutput = yield comments_query_repository_1.commentsQueryRepository.mapToCommentOutput(comment);
            const result = result_type_1.ResultObject.Success(commentOutput);
            res.status(http_statuses_1.HttpStatus.Ok).json(result.data);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=get-comment.handler.js.map