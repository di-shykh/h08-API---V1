// jest.mock('../../../src/auth/middlewares/rate-limiting.middleware', () => ({
//     rateLimitGuard: jest.fn((req, res, next) => next())
// }));


import {Express} from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {AUTH_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import { EmailAdapter } from "../../../src/auth/adapters/email.adapter";
import express from "express";
import request from "supertest";

describe("Check password recovery flow", () =>{
    const app: Express = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    let emailAdapterSpy: jest.SpyInstance;

    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app); // Очищаем перед КАЖДЫМ тестом
        if (emailAdapterSpy) {
            emailAdapterSpy.mockRestore();
        }
        emailAdapterSpy = jest.spyOn(EmailAdapter.prototype, 'sendRecoveryCodeOnEmail')
            .mockImplementation(jest.fn().mockResolvedValue(undefined));
    });
    afterEach(async () => {
        emailAdapterSpy.mockRestore();
    })
    afterAll(async () => {
        emailAdapterSpy.mockRestore();
        await stopDb();
    });

    describe("/password-recovery", () =>{

        it("should send recoveryCode 204", async () => {
            const email = "testuser@mail.ru";
            const newUser = {
                login: "testuser",
                password: "testpassword",
                email
            }

            const userResp = await request(app)
                .post(`${AUTH_PATH}/registration`)
                .send(newUser)
                .expect(HttpStatus.NoContent);

            const response = await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.NoContent);

            expect(emailAdapterSpy).toHaveBeenCalledTimes(1);
            expect(emailAdapterSpy).toHaveBeenCalledWith(
                email,
                expect.any(String)
            );
        });
        it("should return 204 even for non-existent email", async () => {
            const email = "nonexistent@mail.ru"

            const response = await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.NoContent);
            expect(emailAdapterSpy).not.toHaveBeenCalled();
        });
        it("should return 400 for invalid email format", async () => {
            const invalidEmail = "not-an-email";

            await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({ email: invalidEmail })
                .expect(HttpStatus.BadRequest);

            expect(emailAdapterSpy).not.toHaveBeenCalled();
        });
        it("should return 429 for more than 5 attempts from one IP-address during 10 seconds ", async () => {
            const email = "nonexistent@mail.ru";
            const maxAttempts = 5;

            for(let i= 0; i < maxAttempts; ++i) {
                await request(app)
                    .post(`${AUTH_PATH}/password-recovery`)
                    .send({email})
                    .expect(HttpStatus.NoContent);
            }
            await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.TooManyRequests);
        });
    });
    describe("/new-password", () =>{
        it("should send 204 If code is valid and new password is accepted", async () => {
            let sentRecoveryCode: string = '';

            emailAdapterSpy.mockImplementation((email: string, code: string) => {
                sentRecoveryCode = code;
                return Promise.resolve();
            })

            const email = "testuser@mail.ru";
            const newUser = {
                login: "testuser",loginOrEmail: email,
                password: "testpassword",
                email
            }

            const userResp = await request(app)
                .post(`${AUTH_PATH}/registration`)
                .send(newUser)
                .expect(HttpStatus.NoContent);

            await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.NoContent);

            const recoveryCode = sentRecoveryCode;
            expect(recoveryCode).toBeDefined();

            const newPassword = "newPassword";
            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode
                })
                .expect(HttpStatus.NoContent);

            await request(app)
                .post(`${AUTH_PATH}/login`)
                .send({
                    loginOrEmail: email,
                    password: newUser.password,
                })
                .expect(HttpStatus.Unauthorized);

            const loginResponse = await request(app)
                .post(`${AUTH_PATH}/login`)
                .send({
                    loginOrEmail: email,
                    password: newPassword,
                })
                .expect(HttpStatus.Ok);

            expect(loginResponse.body.accessToken).toBeDefined();
        })
        it("should return 400 for invalid recovery code", async () => {
            let sentRecoveryCode: string = '';
            emailAdapterSpy.mockImplementation((email: string, code: string) => {
                sentRecoveryCode = code;
                return Promise.resolve();
            })

            const email = "testuser@mail.ru";
            const newUser = {
                login: "testuser",loginOrEmail: email,
                password: "testpassword",
                email
            }

            await request(app)
                .post(`${AUTH_PATH}/registration`)
                .send(newUser)
                .expect(HttpStatus.NoContent);

            await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.NoContent);

            const newPassword = "newPassword";
            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode: 'totally-invalid-code'
                })
                .expect(HttpStatus.BadRequest);

            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode: '12345678-1234-1234-1234-123456789012'
                })
                .expect(HttpStatus.BadRequest);

            const recoveryCode = sentRecoveryCode;
            expect(recoveryCode).toBeDefined();

            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode
                })
                .expect(HttpStatus.NoContent);

            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode
                })
                .expect(HttpStatus.BadRequest);
        });
        it("should return 429 for more than 5 attempts from one IP-address during 10 seconds", async () => {
            let sentRecoveryCode: string = '';
            emailAdapterSpy.mockImplementation((email: string, code: string) => {
                sentRecoveryCode = code;
                return Promise.resolve();
            })

            const email = "testuser@mail.ru";
            const maxAttempts = 5;
            const newPassword = "newPassword";
            const newUser = {
                login: "testuser",loginOrEmail: email,
                password: "testpassword",
                email
            }

            const userResp = await request(app)
                .post(`${AUTH_PATH}/registration`)
                .send(newUser)
                .expect(HttpStatus.NoContent);

            await request(app)
                .post(`${AUTH_PATH}/password-recovery`)
                .send({email})
                .expect(HttpStatus.NoContent);

            const recoveryCode = sentRecoveryCode;
            expect(recoveryCode).toBeDefined();

            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode
                })
                .expect(HttpStatus.NoContent);
            for (let i = 1; i<maxAttempts; ++i) {
                await request(app)
                    .post(`${AUTH_PATH}/new-password`)
                    .send({
                        newPassword,
                        recoveryCode
                    })
                    .expect(HttpStatus.BadRequest);
            }
            await request(app)
                .post(`${AUTH_PATH}/new-password`)
                .send({
                    newPassword,
                    recoveryCode
                })
                .expect(HttpStatus.TooManyRequests);
        })
    })
})