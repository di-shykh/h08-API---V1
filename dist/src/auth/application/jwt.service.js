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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.jwtService = {
    createToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId, type: 'access', iat: Date.now() }, secret, { expiresIn: '10s' });
            const refreshToken = jsonwebtoken_1.default.sign({ userId, type: 'refresh', iat: Date.now() }, secret, { expiresIn: '20s' });
            return { accessToken, refreshToken };
        });
    },
    decodeToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.decode(token);
            }
            catch (e) {
                console.error("Can't decode token", e);
                return null;
            }
        });
    },
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            }
            catch (e) {
                console.error("Can't verify token", e);
                return null;
            }
        });
    },
    verifyTokenFull(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            }
            catch (e) {
                console.error("Can't verify token", e);
                return null;
            }
        });
    }
};
//# sourceMappingURL=jwt.service.js.map