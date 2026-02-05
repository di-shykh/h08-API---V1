import {Router} from "express";
import {RefreshTokenGuard} from "../../auth/middlewares/refresh.token.guard";
import {getSessionListHandler} from "./handlers/get-session-list.handler";
import {deleteSessionHandler} from "./handlers/delete-session.handler";
import {deleteSessionListHandler} from "./handlers/delete-session-list.handler";

export const securityRouter: Router = Router({});

securityRouter
    .get(
        "/devices",
        RefreshTokenGuard,
        getSessionListHandler
    )
    .delete(
        "/devices/:id",
        RefreshTokenGuard,
        deleteSessionHandler
    )
    .delete(
        "/devices",
        RefreshTokenGuard,
        deleteSessionListHandler
    )