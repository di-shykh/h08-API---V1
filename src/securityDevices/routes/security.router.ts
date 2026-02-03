import {Router} from "express";
import {RefereshTokenGuard} from "../../auth/middlewares/refresh.token.guard";
import {getSessionListHandler} from "./handlers/get-session-list.handler";
import {deleteSessionHandler} from "./handlers/delete-session.handler";
import {deleteSessionListHandler} from "./handlers/delete-session-list.handler";

export const securityRouter: Router = Router({});

securityRouter
    .get(
        "/devices",
        RefereshTokenGuard,
        getSessionListHandler
    )
    .delete(
        "/devices/:id",
        RefereshTokenGuard,
        deleteSessionHandler
    )
    .delete(
        "/devices",
        RefereshTokenGuard,
        deleteSessionListHandler
    )