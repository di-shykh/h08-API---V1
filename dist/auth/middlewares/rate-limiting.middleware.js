"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Общий лимитер для всех эндпоинтов
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // 100 запросов за 15 минут с одного IP
    message: 'Слишком много запросов с этого IP, попробуйте позже',
    standardHeaders: true, // Возвращает заголовки RateLimit-*
    legacyHeaders: false, // Отключает устаревшие заголовки
});
//# sourceMappingURL=rate-limiting.middleware.js.map