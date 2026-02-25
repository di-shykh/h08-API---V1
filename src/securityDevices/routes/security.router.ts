import {Router} from "express";
import {RefreshTokenGuard} from "../../auth/middlewares/refresh.token.guard";
import {container} from "../../inversify-ioc";
import {SecurityController} from "./security.controller";

const securityController = container.get(SecurityController);
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