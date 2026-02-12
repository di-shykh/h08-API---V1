import {Router} from "express";
import {RefreshTokenGuard} from "../../auth/middlewares/refresh.token.guard";
import {securityController} from "../../composition.root";

export const securityRouter: Router = Router({});

securityRouter
    .get(
        "/devices",
        RefreshTokenGuard,
        securityController.getSessionList.bind(securityController)
    )
    .delete(
        "/devices/:id",
        RefreshTokenGuard,
        securityController.deleteSession.bind(securityController)
    )
    .delete(
        "/devices",
        RefreshTokenGuard,
        securityController.deleteSessionList.bind(securityController)
    )