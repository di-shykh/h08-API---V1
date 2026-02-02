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
exports.updateCommentHandler = updateCommentHandler;
const error_handler_1 = require("../../../core/errors/error.handler");
const comment_services_1 = require("../../application/comment.services");
const result_code_1 = require("../../../core/result/result.code");
const resultCodeToHttpExeptions_1 = require("../../../core/result/resultCodeToHttpExeptions");
const http_statuses_1 = require("../../../core/types/http-statuses");
function updateCommentHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const commentId = req.params.id;
            const userId = req.userId;
            const content = req.body;
            const result = yield comment_services_1.commentsService.updateComment(commentId, userId, content);
            if (result.status === result_code_1.ResultStatus.Forbidden) {
                res.status((0, resultCodeToHttpExeptions_1.resultCodeToHttpException)(result_code_1.ResultStatus.Forbidden)).json({
                    errorsMessages: result.errorMessage,
                });
                return;
            }
            if (result.status === result_code_1.ResultStatus.NotFound) {
                res.status((0, resultCodeToHttpExeptions_1.resultCodeToHttpException)(result_code_1.ResultStatus.NotFound)).json({
                    errorsMessages: result.errorMessage,
                });
                return;
            }
            if (result.status === result_code_1.ResultStatus.NoContent) {
                res.sendStatus(http_statuses_1.HttpStatus.NoContent);
            }
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=update-comment.handler.js.map