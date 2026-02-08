import express, {Express} from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {getUserDto} from "../../utils/users/get-user-dto";
import {createUser} from "../../utils/users/create-user";
import request from "supertest";
import {AUTH_PATH, SECURITY_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {getCookiesString, hasCookieWithName, validateRefreshTokenCookie} from "../../utils/cookies.helpers";
import jwt from 'jsonwebtoken';
import {describe} from "node:test";

const TEST_USER = {
    LOGIN: 'TestUser',
    PASSWORD: 'password123',
    EMAIL: 'test@example.com'
}
const TEST_USER_2 = {
    LOGIN: 'Anya',
    PASSWORD: '12345678',
    EMAIL: 'anna@email.com'
}
// Хелпер для логина
export const loginUser = async (
    app: Express,
    credentials: {loginOrEmail: string, password: string}
): Promise<{accessToken: string; refreshTokenCookie: string}> => {
    const response = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send(credentials)
        .expect(HttpStatus.Ok);

    const cookies = getCookiesString(response);
    validateRefreshTokenCookie(cookies);

    return {
        accessToken: response.body.accessToken,
        refreshTokenCookie: cookies
    };
};
// Хелпер для проверки валидности JWT
const validateJWT = (token: string): jwt.JwtPayload => {
    try {
        // Декодируем без проверки подписи (для тестов)
        const decoded = jwt.decode(token, { complete: true });

        if (!decoded) {
            fail('Failed to decode JWT token');
        }

        expect(decoded.header).toHaveProperty('alg');
        expect(decoded.header.alg).toBe('HS256'); // или ваш алгоритм

        const payload = decoded.payload as jwt.JwtPayload;

        expect(payload).toHaveProperty('userId');
        expect(payload).toHaveProperty('exp');
        expect(payload).toHaveProperty('iat');

        return payload;
    } catch (error) {
        fail(`Invalid JWT token: ${error}`);
    }
};

function extractTokenFromCookie(cookieString: string): string | null {
    if (!cookieString) return null;

    const match = cookieString.match(/refreshToken=([^;]+)/);
    if (!match || !match[1]) return null;

    return match[1];
}
// создает истекший токен
export const createExpiredAccessToken = (userId: string): string => {
    return jwt.sign(
        {
            userId: userId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000) - 3600, // выпущен час назад
            exp: Math.floor(Date.now() / 1000) - 1800  // истек полчаса назад
        },
        process.env.JWT_SECRET || 'test-secret',
        { algorithm: 'HS256' }
    );
};
export const createExpiredToken = (userId:string, deviceId = 'test-device')=> {
    return jwt.sign(
        {
            userId,
            deviceId,
            iat: Math.floor(Date.now() / 1000) - 3600 // issued 1 hour ago
        },
        process.env.JWT_ACCESS_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Минус 1 час - уже истек
    );
}

describe("Check Auth: POST /auth/login", () => {
    const app: Express = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app); // Очищаем перед КАЖДЫМ тестом
    });
    afterAll(async () => {
        stopDb();
    });
    describe("POST /auth/login", () => {
        describe("Successful login scenarios", () => {
            it("should login with login and return access token + refresh cookie", async () => {
                const user = await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER_2.LOGIN,
                    password: TEST_USER_2.PASSWORD,
                    email: TEST_USER_2.EMAIL
                })
                const result = await loginUser(app, {
                    loginOrEmail: TEST_USER_2.LOGIN,
                    password: TEST_USER_2.PASSWORD
                });
                // Assert
                validateJWT(result.accessToken);
                validateRefreshTokenCookie(result.refreshTokenCookie);
                expect(hasCookieWithName(result.refreshTokenCookie, 'refreshToken')).toBe(true);
            })
            it("should login with email and return access token + refresh cookie", async () => {
                // Arrange
                await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER_2.LOGIN,
                    password: TEST_USER_2.PASSWORD,
                    email: TEST_USER_2.EMAIL
                });

                // Act
                const result = await loginUser(app, {
                    loginOrEmail: TEST_USER_2.EMAIL,
                    password: TEST_USER_2.PASSWORD
                });

                // Assert
                validateJWT(result.accessToken);
                validateRefreshTokenCookie(result.refreshTokenCookie);
                expect(hasCookieWithName(result.refreshTokenCookie, 'refreshToken')).toBe(true);
            });
        });
        describe("Failed login scenarios", () => {
            beforeEach(async () => {
                await createUser(app, {
                    ...getUserDto(),
                    login: 'Alya',
                    password: '12345678',
                    email: 'alya@email.com'
                });
            });
            it("should return 400 for empty loginOrEmail", async () => {
                const response = await request(app)
                    .post(`${AUTH_PATH}/login`)
                    .send({loginOrEmail: '', password: '12345678'})
                    .expect(HttpStatus.BadRequest);
                const cookies = getCookiesString(response);
                expect(cookies).not.toContain('refreshToken=');
            });
            it("should return 400 for empty password", async () => {
                const response = await request(app)
                    .post(`${AUTH_PATH}/login`)
                    .send({loginOrEmail: 'Alya', password: ''})
                    .expect(HttpStatus.BadRequest);
                const cookies = getCookiesString(response);
                expect(cookies).not.toContain('refreshToken=');
            });
            it("should return 401 for wrong password", async () => {
                const response = await request(app)
                    .post(`${AUTH_PATH}/login`)
                    .send({loginOrEmail: 'alya@email.com', password: 'wrongwrongpas'})
                    .expect(HttpStatus.Unauthorized);

                const cookies = getCookiesString(response);
                expect(cookies).not.toContain('refreshToken=');
            });
            it("should return 401 for non-existent user", async () => {
                const response = await request(app)
                    .post(`${AUTH_PATH}/login`)
                    .send({loginOrEmail: 'nonexistent', password: '12345678'})
                    .expect(HttpStatus.Unauthorized);
                const cookies = getCookiesString(response);
                expect(cookies).not.toContain('refreshToken=');
            });
        });
    })
    describe("GET /auth/me", () => {
        describe("Successful access", () => {
            it("should return user data with valid access token", async () => {
                const user = await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD,
                    email: TEST_USER.EMAIL
                });

                const {accessToken} = await loginUser(app, {
                    loginOrEmail: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD
                });

                // Act
                const response = await request(app)
                    .get(`${AUTH_PATH}/me`)
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(HttpStatus.Ok);

                // Assert
                expect(response.body).toEqual({
                    email: TEST_USER.EMAIL,
                    login: TEST_USER.LOGIN,
                    userId: expect.any(String)
                });
            });
        });
        describe("Failed access", () => {
            it("should return 401 if try to access with expired token", async () => {
                const user = await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD,
                    email: TEST_USER.EMAIL
                });
                const expiredToken = createExpiredAccessToken(user.id);
                const response = await request(app)
                    .get(`${AUTH_PATH}/me`)
                    .set('Authorization', `Bearer ${expiredToken}`)
                    .expect(HttpStatus.Unauthorized);
            });
            it("should return 401 if try to access without token", async () => {
                const user = await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD,
                    email: TEST_USER.EMAIL
                });
                const {accessToken} = await loginUser(app, {
                    loginOrEmail: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD
                });
                const response = await request(app)
                    .get(`${AUTH_PATH}/me`)
                    .expect(HttpStatus.Unauthorized);
            });
        });
        describe("Refresh token flow", () => {
            it("should refresh access token using refresh token cookie", async () => {
                await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD,
                    email: TEST_USER.EMAIL
                });

                const {refreshTokenCookie} = await loginUser(app, {
                    loginOrEmail: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD
                });

                // Act
                const refreshResponse = await request(app)
                    .post(`${AUTH_PATH}/refresh-token`)
                    .set('Cookie', [refreshTokenCookie])
                    .expect(HttpStatus.Ok);

                // Assert
                expect(refreshResponse.body).toHaveProperty('accessToken');
                validateJWT(refreshResponse.body.accessToken);

                // Проверяем, что выдан новый refresh token
                const newCookies = getCookiesString(refreshResponse);
                expect(newCookies).toContain('refreshToken=');

                const oldTokenValue = extractTokenFromCookie(refreshTokenCookie);
                const newTokenValue = extractTokenFromCookie(newCookies);
                expect(newTokenValue).not.toBe(oldTokenValue); // Должен быть новый
            });
            it("should logout and clear refresh token", async () => {
                await createUser(app, {
                    ...getUserDto(),
                    login: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD,
                    email: TEST_USER.EMAIL
                });

                const { refreshTokenCookie } = await loginUser(app, {
                    loginOrEmail: TEST_USER.LOGIN,
                    password: TEST_USER.PASSWORD
                });

                // Act
                const logoutResponse = await request(app)
                    .post(`${AUTH_PATH}/logout`)
                    .set('Cookie', [refreshTokenCookie])
                    .expect(HttpStatus.NoContent);

                // Assert - кука должна быть очищена
                const clearedCookie = logoutResponse.headers['set-cookie']?.[0];
                expect(clearedCookie).toContain('refreshToken=;');
                expect(clearedCookie).toContain('Expires=Thu, 01 Jan 1970');
            });
        });
    });
});


