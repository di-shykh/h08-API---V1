import rateLimit from 'express-rate-limit';
jest.mock('express-rate-limit', () => ({
    __esModule: true,
    default: jest.fn(() => (req: any, res: any, next: any) => next())
}));
jest.mock('../../../src/auth/adapters/email.adapter', () => {
    const mockSendEmail = jest.fn().mockResolvedValue(undefined);
    const mockResendEmail = jest.fn().mockResolvedValue(undefined);

    return {
        emailAdapter: {
            sendConfirmationEmail: mockSendEmail,
            resendEmail: mockResendEmail
        }
    };
});

import express, {Express} from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb, userCollection} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import request from "supertest";
import {AUTH_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {beforeEach} from "node:test";
import {v4 as uuidv4} from "uuid";

// import { emailAdapter } from '../../mocks/email-adapter';
import { emailAdapter } from '../../../src/auth/adapters/email.adapter';

process.env.NODE_ENV = 'test';
describe("Check Auth: POST /auth/registration and POST /auth/registration-confirmation", () => {
    const app: Express = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    beforeAll(async () => {
        // process.env.DISABLE_RATE_LIMIT = 'true';
        jest.restoreAllMocks();
        jest.clearAllMocks();
        await runDB(SETTINGS.MONGO_URL_TEST);
        await clearDb(app);
    });
    beforeEach(async () => {
        //await clearDb(app);
        // Очищаем моки перед каждым тестом
        (emailAdapter.sendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);
        (emailAdapter.resendEmail as jest.Mock).mockResolvedValue(undefined);
    })
    afterAll(async () => {
        // delete process.env.DISABLE_RATE_LIMIT;
        stopDb();
    });
    it('should register user and send registration code to email: POST /hometask_07/api/auth/registration', async () => {
        // Получаем мок-функции
        const mockSendEmail = emailAdapter.sendConfirmationEmail as jest.Mock;

        const registrationData = {
            login: 'testUser',
            password: 'testPassword',
            email: 'di49@mail.ru',
        }
        const response = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        // Проверяем вызов email adapter
        expect(mockSendEmail).toHaveBeenCalledTimes(1);
        expect(mockSendEmail).toHaveBeenCalledWith(
            'di49@mail.ru',
            expect.any(String)
        );
    })
    it('should not register user and send registration code to email: POST /hometask_07/api/auth/registration', async () => {

        const registrationData = {
            login: 't',
            password: 'testPassword',
            email: 'di49@mail.ru',
        }
        const response = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.BadRequest);

        const registrationData2 = {
            login: 'testUser2',
            password: 'testPassword',
            email: 'test@mail.ru',
        }
        const response2 = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData2)
            .expect(HttpStatus.NoContent);

        const registrationData3 = {
            login: 'testUser2',
            password: 'testPassword',
            email: 'di@mail.ru',
        }
        const response3 = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData3)
            .expect(HttpStatus.BadRequest);

        const registrationData4 = {
            login: 'testUser4',
            password: 'testPassword3',
            email: '@mail.ru',
        }
        const response4 = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData4)
            .expect(HttpStatus.BadRequest);

        const registrationData5 = {
            login: 'testUser4',
            password: 'testPassword3',
            email: 'test@mail.ru',
        }
        const response5 = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData5)
            .expect(HttpStatus.BadRequest);

        const registrationData6 = {
            login: 'testUser4',
            password: '',
            email: 'di_49@mail.ru',
        }
        const response6 = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData6)
            .expect(HttpStatus.BadRequest);
    })
    it('should confirm registration: POST /hometask_07/api/auth/registration-confirmation', async () => {
        let sentCode: string = '';

        (emailAdapter.sendConfirmationEmail as jest.Mock).mockImplementation(
            async (email: string, code: string) => {
                sentCode = code;
                return undefined;
            }
        );
        //const mockSendEmail = emailAdapter.sendConfirmationEmail as jest.Mock;
        (emailAdapter.resendEmail as jest.Mock).mockResolvedValue(undefined);

        const email: string = 'di49@mail.ru';
        const registrationData = {
            login: 'testUser',
            password: 'testPassword',
            email,
        }
        // Регистрация
        const response = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        // Проверяем вызов email adapter
        expect(emailAdapter.sendConfirmationEmail).toHaveBeenCalledTimes(1);
        expect(emailAdapter.sendConfirmationEmail).toHaveBeenCalledWith(
            'di49@mail.ru',
            expect.any(String)
        );
        // Проверяем что код был сохранен в переменной sentCode
        expect(sentCode).toBeTruthy();
        expect(typeof sentCode).toBe('string');

        const confirmationRecord = await userCollection.findOne({ email });
        expect(confirmationRecord).toBeDefined();
        expect(confirmationRecord?.emailConfirmation).toBeDefined();
        expect(confirmationRecord?.emailConfirmation?.confirmationCode).toBeDefined();

        // Сравниваем код отправленный с кодом в БД
        expect(sentCode).toBe(confirmationRecord!.emailConfirmation!.confirmationCode);

        if (!confirmationRecord || !confirmationRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        const confirmationCode = confirmationRecord!.emailConfirmation.confirmationCode;

        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationCode })
            .expect(HttpStatus.NoContent);
    })
    it('should not confirm registration with wrong code: POST /hometask_07/api/auth/registration-confirmation', async () => {
        const email: string = 'di49@mail.ru';
        const registrationData = {
            login: 'testUser',
            password: 'testPassword',
            email,
        }
        const response = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);
        const confirmationRecord = await userCollection.findOne({ email });
        expect(confirmationRecord).toBeDefined();
        expect(confirmationRecord?.emailConfirmation).toBeDefined();
        expect(confirmationRecord?.emailConfirmation?.confirmationCode).toBeDefined();

        if (!confirmationRecord || !confirmationRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        const confirmationCode = confirmationRecord!.emailConfirmation.confirmationCode;

        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationCode })
            .expect(HttpStatus.NoContent);

        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: confirmationCode })
            .expect(HttpStatus.BadRequest);

        const code: string = uuidv4();
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: code })
            .expect(HttpStatus.BadRequest);
    })
    it('should reject expired confirmation code', async () => {
        const email: string = 'di49@mail.ru';
        const registrationData = {
            login: 'testUser',
            password: 'testPassword',
            email,
        };

        await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        const user = await userCollection.findOne({ email });
        expect(user).toBeDefined();
        expect(user!.emailConfirmation).toBeDefined();

        const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 часов назад
        await userCollection.updateOne(
            { email },
            {
                $set: {
                    'emailConfirmation.expirationDate': expiredDate
                }
            }
        );

        const updatedUser = await userCollection.findOne({ email });
        if (!updatedUser|| !updatedUser.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }
        console.log('Expired date:', updatedUser!.emailConfirmation.expirationDate);

        // Пытаемся подтвердить с истекшим кодом
        if (!user|| !user.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: user!.emailConfirmation.confirmationCode })
            .expect(HttpStatus.BadRequest); // Ожидаем ошибку
    });
    it ('should resend confirmation code on email: POST /hometask_07/api/auth/registration-email-resending', async () => {
        const mockSendEmail = emailAdapter.sendConfirmationEmail as jest.Mock;

        const email: string = 'di49@mail.ru';
        const registrationData = {
            login: 'testUser',
            password: 'testPassword',
            email,
        }
        const response = await request(app)
            .post(`${AUTH_PATH}/registration`)
            .send(registrationData)
            .expect(HttpStatus.NoContent);

        expect(mockSendEmail).toHaveBeenCalledTimes(1);
        expect(mockSendEmail).toHaveBeenCalledWith(
            'di49@mail.ru',
            expect.any(String)
        );

        const initialRecord = await userCollection.findOne({ email });
        if (!initialRecord || !initialRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        const code = initialRecord!.emailConfirmation.confirmationCode;

        const response2 = await request(app)
            .post(`${AUTH_PATH}/registration-email-resending`)
            .send({email: email})
            .expect(HttpStatus.NoContent);

        expect(mockSendEmail).toHaveBeenCalledTimes(1);
        expect(mockSendEmail).toHaveBeenCalledWith(
            'di49@mail.ru',
            expect.any(String)
        );


        const updatedRecord = await userCollection.findOne({ email });
        if (!updatedRecord || !updatedRecord.emailConfirmation) {
            throw new Error('Registration record not found or incomplete');
        }

        expect(updatedRecord.emailConfirmation.confirmationCode).not.toBe(initialRecord.emailConfirmation.confirmationCode)
        expect(updatedRecord.emailConfirmation.expirationDate).not.toBe(initialRecord.emailConfirmation.expirationDate)
        // Дата истечения должна быть в будущем
        expect(new Date(updatedRecord.emailConfirmation.expirationDate).getTime())
            .toBeGreaterThan(Date.now());
        expect(updatedRecord.emailConfirmation.isConfirmed).toBe(false);
        //Проверяем что старый код не работает
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: initialRecord.emailConfirmation.confirmationCode })
            .expect(HttpStatus.BadRequest);
        //Проверяем что новый код работает
        await request(app)
            .post(`${AUTH_PATH}/registration-confirmation`)
            .send({ code: updatedRecord.emailConfirmation.confirmationCode })
            .expect(HttpStatus.NoContent);
    })
});