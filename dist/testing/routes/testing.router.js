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
exports.testingRouter = void 0;
const express_1 = require("express");
const http_statuses_1 = require("../../core/types/http-statuses");
const mongo_bd_1 = require("../../db/mongo.bd");
exports.testingRouter = (0, express_1.Router)({});
exports.testingRouter.delete('/all-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('✅ Testing endpoint called'); // для диагностики
    yield Promise.all([
        mongo_bd_1.blogCollection.deleteMany(),
        mongo_bd_1.postCollection.deleteMany(),
        mongo_bd_1.userCollection.deleteMany(),
        mongo_bd_1.commentCollection.deleteMany(),
    ]);
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
}));
//# sourceMappingURL=testing.router.js.map