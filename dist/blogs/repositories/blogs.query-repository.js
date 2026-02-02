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
exports.blogsQueryRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_bd_1 = require("../../db/mongo.bd");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.blogsQueryRepository = {
    findAllBlogs() {
        return __awaiter(this, void 0, void 0, function* () {
            return mongo_bd_1.blogCollection.find().toArray();
        });
    },
    findBlogById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return mongo_bd_1.blogCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
        });
    },
    findManyBlogs(queryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm, } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            const filter = {};
            if (searchNameTerm) {
                filter.name = { $regex: searchNameTerm, $options: "i" };
            }
            const items = yield mongo_bd_1.blogCollection
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_bd_1.blogCollection.countDocuments(filter);
            return { items, totalCount };
        });
    },
    findBlogByIdOrFail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield mongo_bd_1.blogCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!res) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Blog not found.");
            }
            return res;
        });
    },
    mapToBlogListPaginatedOutput(blogs, pageNumber, pageSize, totalCount) {
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: blogs.map((blog) => ({
                id: blog._id.toString(),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
            })),
        };
    },
    mapToBlogOutput(blog) {
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
        };
    },
};
//# sourceMappingURL=blogs.query-repository.js.map