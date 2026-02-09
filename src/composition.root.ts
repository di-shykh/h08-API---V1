import {BcryptService} from "./auth/adapters/bcrypt.service";
import {EmailAdapter} from "./auth/adapters/email.adapter";
import {AuthService} from "./auth/application/auth.service";
import {JwtService} from "./auth/application/jwt.service";
import {AuthController} from "./auth/routes/auth.controller";
import {SecurityService} from "./securityDevices/application/security.services";
import {SessionQueryRepository} from "./securityDevices/repositories/session.query-repository";
import {SessionRepository} from "./securityDevices/repositories/session.repository";
import {SecurityController} from "./securityDevices/routes/security.controller";

export const bcryptService = new BcryptService();
export const emailAdapter = new EmailAdapter();
export const jwtService = new JwtService();
export const sessionRepository = new SessionRepository();
export const sessionQueryRepository = new SessionQueryRepository();
export const authService = new AuthService(bcryptService,jwtService,emailAdapter);

export const authController = new AuthController(authService,jwtService);
export const securityService = new SecurityService(jwtService, sessionRepository);

export const securityController = new SecurityController(sessionQueryRepository,securityService);