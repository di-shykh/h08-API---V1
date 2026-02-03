import {Router} from "express";
import {RefereshTokenGuard} from "../../auth/middlewares/refresh.token.guard";

export const securityRouter: Router = Router({});

securityRouter
    .get(
        "/devices",
        RefereshTokenGuard,
        getSessionListHandler
    )