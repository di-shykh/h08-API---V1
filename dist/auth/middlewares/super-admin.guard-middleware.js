"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminMiddleware = exports.ADMIN_PASSWORD = exports.ADMIN_USERNAME = void 0;
const http_statuses_1 = require("../../core/types/http-statuses");
exports.ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "qwerty";
const superAdminMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            return;
        }
        const [authType, authToken] = authHeader.split(" ");
        if (authType !== "Basic") {
            res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            return;
        }
        if (!authToken) {
            res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            return;
        }
        const credentials = Buffer.from(authToken, "base64").toString("utf-8");
        const [username, password] = credentials.split(":");
        if (username !== exports.ADMIN_USERNAME || password !== exports.ADMIN_PASSWORD) {
            res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            return;
        }
    }
    catch (err) {
        res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
        return;
    }
    next();
};
exports.superAdminMiddleware = superAdminMiddleware;
//# sourceMappingURL=super-admin.guard-middleware.js.map