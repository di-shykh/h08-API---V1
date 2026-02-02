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
exports.commentsRepository = void 0;
const mongo_bd_1 = require("../../db/mongo.bd");
const mongodb_1 = require("mongodb");
exports.commentsRepository = {
    createComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertedComment = yield mongo_bd_1.commentCollection.insertOne(comment);
            return insertedComment.insertedId.toString();
        });
    },
    deleteComment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedComments = yield mongo_bd_1.commentCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            return deletedComments;
        });
    },
    updateComment(commentId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedComment = yield mongo_bd_1.commentCollection.updateOne({ _id: new mongodb_1.ObjectId(commentId) }, {
                $set: {
                    content: dto.content,
                }
            });
            return updatedComment;
        });
    }
};
//# sourceMappingURL=comments.repository.js.map