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
exports.usersRepository = void 0;
const mongo_bd_1 = require("../../db/mongo.bd");
const mongodb_1 = require("mongodb");
const repository_not_found_error_1 = require("../../core/errors/repository-not-found.error");
exports.usersRepository = {
    createUser(newUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertedUser = yield mongo_bd_1.userCollection.insertOne(newUser);
            return insertedUser.insertedId.toString();
        });
    },
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedUser = yield mongo_bd_1.userCollection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
            if (deletedUser.deletedCount < 1) {
                throw new repository_not_found_error_1.RepositoryNotFoundError("User not found");
            }
            return;
        });
    },
    confirmEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_bd_1.userCollection.updateOne({ "emailConfirmation.confirmationCode": code }, { $set: {
                        "emailConfirmation.isConfirmed": true,
                        "emailConfirmation.confirmationCode": null
                    }
                });
                return result.modifiedCount === 1;
            }
            catch (error) {
                console.error("Error confirming email:", error);
                return false;
            }
        });
    },
    updateUserEmailConfirmation(_id, confirmationCode, expirationDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_bd_1.userCollection.updateOne({ _id: _id }, {
                    $set: {
                        "emailConfirmation.confirmationCode": confirmationCode,
                        "emailConfirmation.expirationDate": expirationDate
                    }
                });
                return result.modifiedCount === 1;
            }
            catch (error) {
                console.error("Error updating email confirmation:", error);
                return false;
            }
        });
    }
};
//# sourceMappingURL=user.repository.js.map