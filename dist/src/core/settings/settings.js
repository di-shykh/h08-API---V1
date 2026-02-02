"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.SETTINGS = {
    PORT: process.env.PORT || 5001,
    MONGO_URL_TEST: process.env.MONGO_URL_TEST || 'mongodb://0.0.0.0:27017/test_db',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    DB_NAME: process.env.DB_NAME || 'h03-db',
};
//# sourceMappingURL=settings.js.map