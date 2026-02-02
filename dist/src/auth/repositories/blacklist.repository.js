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
exports.blacklistRepository = void 0;
const mongo_bd_1 = require("../../db/mongo.bd");
exports.blacklistRepository = {
    insertToken(oldToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const insertResult = yield mongo_bd_1.tokenListCollection.insertOne(oldToken);
            return insertResult.insertedId.toString();
        });
    },
    deleteToken(token) {
        return __awaiter(this, void 0, void 0, function* () { });
    },
    isTokenBlacklisted(tokenHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield mongo_bd_1.tokenListCollection.findOne({ refreshTokenHash: tokenHash });
            return existing !== null;
        });
    },
};
//# sourceMappingURL=blacklist.repository.js.map