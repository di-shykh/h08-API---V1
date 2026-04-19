import { container } from "../../../src/inversify-ioc";
import nodemailer from 'nodemailer';

jest.mock('../../../src/auth/middlewares/rate-limiting.middleware', () => ({
    rateLimitGuard: jest.fn((req, res, next) => next())
}));

import express, { Express } from "express";
import { setupApp } from "../../../src/setup-app";
import { runDB, stopDb } from "../../../src/db/mongo.bd";
import { UserModel } from "../../../src/users/domain/user.entity";
import { SETTINGS } from "../../../src/core/settings/settings";
import { clearDb } from "../../utils/clear-db";
import request from "supertest";
import { AUTH_PATH } from "../../../src/core/paths/paths";
import { HttpStatus } from "../../../src/core/types/http-statuses";
import { v4 as uuidv4 } from "uuid";
import { EmailAdapter } from "../../../src/auth/adapters/email.adapter";

process.env.NODE_ENV = 'test';

describe("Check Auth: POST /auth/registration and POST /auth/registration-confirmation", () => {
    const app: Express = express();
    setupApp(app);
    let testNumber = 0;
    let mockEmailAdapter: EmailAdapter;

    beforeAll(async () => {
        mockEmailAdapter = {
            transporter: {} as nodemailer.Transporter,
            sendConfirmationEmail: jest.fn().mockResolvedValue(undefined),
            resendEmail: jest.fn().mockResolvedValue(undefined),
            sendRecoveryCodeOnEmail: jest.fn().mockResolvedValue(undefined),
        } as EmailAdapter;

        container.unbind(EmailAdapter);
        container.bind(EmailAdapter).toConstantValue(mockEmailAdapter);
        await runDB(SETTINGS.MONGO_URL_TEST);
        await clearDb(app);

    });

    beforeEach(async () => {
        await clearDb(app);

        // Очищаем все моки
        jest.clearAllMocks();
        (mockEmailAdapter.sendConfirmationEmail as jest.Mock).mockClear();
        (mockEmailAdapter.resendEmail as jest.Mock).mockClear();
        (mockEmailAdapter.sendRecoveryCodeOnEmail as jest.Mock).mockClear();

        // Сбрасываем реализации к стандартным
        (mockEmailAdapter.sendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
        (mockEmailAdapter.resendEmail as jest.Mock).mockResolvedValue(undefined);
        (mockEmailAdapter.sendRecoveryCodeOnEmail as jest.Mock).mockResolvedValue(undefined);

        testNumber++;
    });

    afterAll(async () => {
        await clearDb(app);
        await stopDb();
    });

    it('should register user and send registration code to email', async () => {
        const registrationData = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email: `test${testNumber}@mail.ru`,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledWith(
            `test${testNumber}@mail.ru`,
            expect.any(String)
        );
    });

    it('should not register user with invalid data', async () => {
        const registrationData = {
            login: 't',
            password: 'testPassword',
            email: `test${testNumber}@mail.ru`,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.BadRequest);

        testNumber++;

        const registrationData2 = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email: `test${testNumber}@mail.ru`,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData2)
            .expect(HttpStatus.NoContent);

        const registrationData3 = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email: `test${testNumber}@mail.ru`,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData3)
            .expect(HttpStatus.BadRequest);

        testNumber++;

        const registrationData4 = {
            login: `user${testNumber}`,
            password: 'testPassword3',
            email: '@mail.ru',
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData4)
            .expect(HttpStatus.BadRequest);

        const registrationData5 = {
            login: `user${testNumber - 1}`,
            password: 'testPassword3',
            email: 'test@mail.ru',
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData5)
            .expect(HttpStatus.BadRequest);
    });

    it('should confirm registration', async () => {
        let sentCode: string = '';

        (mockEmailAdapter.sendConfirmationEmail as jest.Mock).mockImplementation(
            async (email: string, code: string) => {
                sentCode = code;
                return undefined;
            }
        );

        const email: string = `test${testNumber}@mail.ru`;
        const registrationData = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(sentCode).toBeTruthy();
        expect(typeof sentCode).toBe('string');

        const confirmationRecord = await UserModel.findOne({ email });
        expect(confirmationRecord).toBeDefined();
        expect(confirmationRecord?.emailConfirmation?.confirmationCode).toBeDefined();
        expect(sentCode).toBe(confirmationRecord!.emailConfirmation!.confirmationCode);

        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationRecord!.emailConfirmation!.confirmationCode })
            .expect(HttpStatus.NoContent);
    });

    it('should not confirm registration with wrong code', async () => {
        const email: string = `test${testNumber}@mail.ru`;
        const registrationData = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        const confirmationRecord = await UserModel.findOne({ email });
        expect(confirmationRecord).toBeDefined();

        const confirmationCode = confirmationRecord!.emailConfirmation!.confirmationCode;

        // Подтверждаем один раз
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationCode })
            .expect(HttpStatus.NoContent);

        // Пытаемся подтвердить второй раз с тем же кодом
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationCode })
            .expect(HttpStatus.BadRequest);

        // Пытаемся с неправильным кодом
        const wrongCode: string = uuidv4();
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: wrongCode })
            .expect(HttpStatus.BadRequest);
    });

    it('should reject expired confirmation code', async () => {
        const email: string = `test${testNumber}@mail.ru`;
        const registrationData = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        const user = await UserModel.findOne({ email });
        expect(user).toBeDefined();
        expect(user!.emailConfirmation).toBeDefined();

        const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 часов назад
        await UserModel.updateOne(
            { email },
            {
                $set: {
                    'emailConfirmation.expirationDate': expiredDate
                }
            }
        );

        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: user!.emailConfirmation!.confirmationCode })
            .expect(HttpStatus.BadRequest);
    });

    it('should resend confirmation code on email', async () => {
        const email: string = `test${testNumber}@mail.ru`;
        const registrationData = {
            login: `user${testNumber}`,
            password: 'testPassword',
            email,
        };

        // Регистрация
        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        // Проверяем первый вызов
        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledTimes(1);

        const initialRecord = await UserModel.findOne({ email });
        if (!initialRecord || !initialRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        // Очищаем мок для следующего вызова
        (mockEmailAdapter.sendConfirmationEmail as jest.Mock).mockClear();

        // Повторная отправка
        await request(app)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send({ email: email })
            .expect(HttpStatus.NoContent);

        // Проверяем, что метод был вызван снова
        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(mockEmailAdapter.sendConfirmationEmail).toHaveBeenCalledWith(
            email,
            expect.any(String)
        );

        const updatedRecord = await UserModel.findOne({ email });
        if (!updatedRecord || !updatedRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        expect(updatedRecord.emailConfirmation.confirmationCode).not.toBe(initialRecord.emailConfirmation.confirmationCode);
        expect(updatedRecord.emailConfirmation.expirationDate).not.toBe(initialRecord.emailConfirmation.expirationDate);
        expect(new Date(updatedRecord.emailConfirmation.expirationDate).getTime()).toBeGreaterThan(Date.now());
        expect(updatedRecord.emailConfirmation.isConfirmed).toBe(false);

        // Проверяем что старый код не работает
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: initialRecord.emailConfirmation.confirmationCode })
            .expect(HttpStatus.BadRequest);

        // Проверяем что новый код работает
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: updatedRecord.emailConfirmation.confirmationCode })
            .expect(HttpStatus.NoContent);
    });
});