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
exports.blogsRepository = void 0;
const mongo_bd_1 = require("../../db/mongo.bd");
const mongodb_1 = require("mongodb");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.blogsRepository = {
    createBlog(newBlog) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertResult = yield mongo_bd_1.blogCollection.insertOne(newBlog);
            return insertResult.insertedId.toString();
        });
    },
    updateBlog(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateResult = yield mongo_bd_1.blogCollection.updateOne({
                _id: new mongodb_1.ObjectId(id),
            }, {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            });
            if (updateResult.matchedCount < 1) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Blog not found.");
            }
            return;
        });
    },
    deleteBlog(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteResult = yield mongo_bd_1.blogCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            if (deleteResult.deletedCount < 1) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Blog not found.");
            }
            return;
        });
    },
};
//# sourceMappingURL=blogs.repository.js.map