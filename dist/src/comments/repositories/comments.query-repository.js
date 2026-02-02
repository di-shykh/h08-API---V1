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
exports.commentsQueryRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_bd_1 = require("../../db/mongo.bd");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.commentsQueryRepository = {
    findCommentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield mongo_bd_1.commentCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!result) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("Comment not found.");
            }
            return result;
        });
    },
    findManyComments(queryDto, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pageNumber, pageSize, sortBy, sortDirection, 
            // postId,
            userId, userLogin, createdAt, searchContentTerm, } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            const filter = {};
            if (searchContentTerm) {
                filter.content = { $regex: searchContentTerm, $options: "i" };
            }
            if (postId) {
                filter.postId = postId;
            }
            if (userId) {
                filter.userId = userId;
            }
            if (createdAt) {
                filter.createdAt = createdAt;
            }
            if (userLogin) {
                filter.userLogin = userLogin;
            }
            const items = yield mongo_bd_1.commentCollection
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_bd_1.commentCollection.countDocuments(filter);
            return { items, totalCount };
        });
    },
    mapToCommentOutput(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongo_bd_1.userCollection.findOne({ _id: new mongodb_1.ObjectId(comment.userId) });
            if (!user) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("User not found.");
            }
            const commentOutput = {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.userId,
                    userLogin: user.login
                },
                createdAt: comment.createdAt,
            };
            return commentOutput;
        });
    },
    mapToCommentListOutput(comments, pageNumber, pageSize, totalCount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (comments.length === 0) {
                return {
                    pagesCount: 0,
                    page: pageNumber,
                    pageSize: pageSize,
                    totalCount: 0,
                    items: []
                };
            }
            const userIds = comments.map(comment => comment.userId);
            const users = yield mongo_bd_1.userCollection.find({
                _id: { $in: userIds.map(id => new mongodb_1.ObjectId(id)) }
            }).toArray();
            const userMap = new Map();
            users.forEach(user => {
                userMap.set(user._id.toString(), user);
            });
            const items = comments.map((comment) => {
                const user = userMap.get(comment.userId);
                if (!user) {
                    throw new repository_not_found_error_1.RepositoryNotFoundError(`User with id ${comment.userId} not found.`);
                }
                return {
                    id: comment._id.toString(),
                    content: comment.content,
                    commentatorInfo: {
                        userId: comment.userId,
                        userLogin: user.login
                    },
                    createdAt: comment.createdAt,
                };
            });
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: items
            };
        });
    }
};
//# sourceMappingURL=comments.query-repository.js.map