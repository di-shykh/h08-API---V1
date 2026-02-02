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
exports.postsQueryRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_bd_1 = require("../../db/mongo.bd");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.postsQueryRepository = {
    findAllPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return mongo_bd_1.postCollection.find().toArray();
        });
    },
    findPostById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongo_bd_1.postCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        });
    },
    findPostsByBlogId(blogId, queryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { 'blogId': blogId };
            let items;
            if (queryDto) {
                const { pageNumber, pageSize, sortBy, sortDirection, } = queryDto;
                const skip = (pageNumber - 1) * pageSize;
                items = yield mongo_bd_1.postCollection
                    .find(filter)
                    .sort({ [sortBy]: sortDirection })
                    .skip(skip)
                    .limit(pageSize)
                    .toArray();
            }
            else {
                items = yield mongo_bd_1.postCollection.find(filter).toArray();
            }
            const totalCount = yield mongo_bd_1.postCollection.countDocuments(filter);
            return { items, totalCount };
        });
    },
    findManyPosts(queryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pageNumber, pageSize, sortBy, sortDirection, searchPostTitleTerm, } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            const filter = {};
            if (searchPostTitleTerm) {
                filter.title = { $regex: searchPostTitleTerm, $options: "i" };
            }
            const items = yield mongo_bd_1.postCollection
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_bd_1.postCollection.countDocuments(filter);
            return { items, totalCount };
        });
    },
    findPostByIdOrFail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield mongo_bd_1.postCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!result) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Post not found.");
            }
            return result;
        });
    },
    mapToPostListPaginatedOutput(posts, pageNumber, pageSize, totalCount) {
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: posts.map((post) => ({
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
            })),
        };
    },
    mapToPostOutput(post) {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
        };
    },
};
//# sourceMappingURL=posts.query-repository.js.map