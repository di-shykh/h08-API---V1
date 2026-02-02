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
exports.updateBlogHandler = updateBlogHandler;
const http_statuses_1 = require("../../../core/types/http-statuses");
const blog_service_1 = require("../../application/blog.service");
const error_handler_1 = require("../../../core/errors/error.handler");
function updateBlogHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            yield blog_service_1.blogsService.update(id, req.body);
            res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        }
        catch (e) {
            (0, error_handler_1.errorHandler)(e, res);
        }
    });
}
//# sourceMappingURL=update-blog.handler.js.map