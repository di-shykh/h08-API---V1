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
exports.usersQueryRepository = void 0;
const mongodb_1 = require("mongodb");
const mongo_bd_1 = require("../../db/mongo.bd");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
const normolize_email_1 = require("../../core/helpers/normolize-email");
exports.usersQueryRepository = {
    findUserByIdOrFail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongo_bd_1.userCollection.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!user) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("User not found.");
            }
            return user;
        });
    },
    isEmailUnique(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedEmail = (0, normolize_email_1.normalizeEmail)(email);
            const user = yield mongo_bd_1.userCollection.findOne({ email: normalizedEmail });
            return !user;
        });
    },
    isLoginUnique(login) {
        return __awaiter(this, void 0, void 0, function* () {
            const loginUser = login.trim();
            const user = yield mongo_bd_1.userCollection.findOne({ login: loginUser });
            return !user;
        });
    },
    findManyUsers(queryDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm, } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            let filter = {};
            if (searchLoginTerm && searchEmailTerm) {
                filter = {
                    $or: [
                        { login: { $regex: searchLoginTerm, $options: "i" } },
                        { email: { $regex: searchEmailTerm, $options: "i" } },
                    ]
                };
            }
            else if (searchLoginTerm) {
                filter.login = { $regex: searchLoginTerm, $options: "i" };
            }
            else if (searchEmailTerm) {
                filter.email = { $regex: searchEmailTerm, $options: "i" };
            }
            const items = yield mongo_bd_1.userCollection
                .find(filter)
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_bd_1.userCollection.countDocuments(filter);
            return { items, totalCount };
        });
    },
    mapToUserOutput(user) {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        };
    },
    mapToUserListPaginatedOutput(users, pageNumber, pageSize, totalCount) {
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: users.map((user) => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
            })),
        };
    },
    findByConfirmationCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield mongo_bd_1.userCollection.findOne({ "emailConfirmation.confirmationCode": code });
            return user;
        });
    },
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedEmail = (0, normolize_email_1.normalizeEmail)(email);
            const user = yield mongo_bd_1.userCollection.findOne({ "email": normalizedEmail });
            return user;
        });
    },
    findByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedEmail = (0, normolize_email_1.normalizeEmail)(loginOrEmail);
            return yield mongo_bd_1.userCollection.findOne({
                $or: [{ login: loginOrEmail }, { email: normalizedEmail }],
            });
        });
    },
};
//# sourceMappingURL=user.query-repository.js.map