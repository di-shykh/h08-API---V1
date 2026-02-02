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
exports.postsRepository = void 0;
const mongo_bd_1 = require("../../db/mongo.bd");
const mongodb_1 = require("mongodb");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.postsRepository = {
    createPost(newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertPost = yield mongo_bd_1.postCollection.insertOne(newPost);
            return insertPost.insertedId.toString();
        });
    },
    updatePost(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatePostResult = yield mongo_bd_1.postCollection.updateOne({ _id: new mongodb_1.ObjectId(id) }, {
                $set: {
                    title: dto.title,
                    shortDescription: dto.shortDescription,
                    content: dto.content,
                    blogId: dto.blogId,
                }
            });
            if (updatePostResult.matchedCount < 1) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Post not found.");
            }
            return;
        });
    },
    deletePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletePostResult = yield mongo_bd_1.postCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            if (deletePostResult.deletedCount < 1) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Post not found.");
            }
            return;
        });
    },
};
//# sourceMappingURL=posts.repository.js.map