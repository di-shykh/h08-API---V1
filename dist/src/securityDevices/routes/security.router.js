"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityRouter = void 0;
const express_1 = require("express");
const refresh_token_guard_1 = require("../../auth/middlewares/refresh.token.guard");
const get_session_list_handler_1 = require("./handlers/get-session-list.handler");
const delete_session_handler_1 = require("./handlers/delete-session.handler");
const delete_session_list_handler_1 = require("./handlers/delete-session-list.handler");
exports.securityRouter = (0, express_1.Router)({});
exports.securityRouter
    .get("/devices", refresh_token_guard_1.RefereshTokenGuard, get_session_list_handler_1.getSessionListHandler)
    .delete("/devices/:id", refresh_token_guard_1.RefereshTokenGuard, delete_session_handler_1.deleteSessionHandler)
    .delete("/devices", refresh_token_guard_1.RefereshTokenGuard, delete_session_list_handler_1.deleteSessionListHandler);
//# sourceMappingURL=security.router.js.map