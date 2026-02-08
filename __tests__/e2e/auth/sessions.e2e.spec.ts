import express, {Express} from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {createUser} from "../../utils/users/create-user";
import request from "supertest";
import {AUTH_PATH, SECURITY_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {createExpiredToken} from "./auth.e2e.spec";
import {loginUser} from "./auth.e2e.spec";
import {SessionOutput} from "../../../src/securityDevices/routes/output/session-output";
import {randomUUID} from "node:crypto";

describe("Sessions tests", () => {
    const app: Express = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    const TEST_USER = {
        login: 'Manya',
        password: '12345678',
        email: 'manya@gmail.com'
    }
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36'
    ];
    let sessions = [];
    let refreshTokens: string[] = [];
    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        //await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app);
        refreshTokens = [];
    });
    afterAll(async () => {
        stopDb();
    });
    async function setupUserWithSessions() {
        // Сначала создаем пользователя
        const user = await createUser(app, {
            login: TEST_USER.login,
            password: TEST_USER.password,
            email: TEST_USER.email
        });
        const createdUserId = user.id;

        const refreshTokens: string[] = [];

        for (let i = 0; i < userAgents.length; i++) {
            const response = await request(app)
                .post(`${AUTH_PATH}/login`)
                .set('User-Agent', userAgents[i])
                .send({
                    loginOrEmail: TEST_USER.login,
                    password: TEST_USER.password
                });

            expect(response.status).toBe(HttpStatus.Ok);

            const cookies = response.headers['set-cookie'] || response.headers['Set-Cookie'];
            if (cookies && cookies[0]) {
                const refreshToken = cookies[0].split(';')[0].split('=')[1];
                refreshTokens.push(refreshToken);
            }
        }

        return refreshTokens;
    }

    it("User should be able to login 4 times with different User-Agents", async () => {

        refreshTokens = await setupUserWithSessions();

        expect(refreshTokens).toHaveLength(4);
        expect(refreshTokens[0]).toBeDefined();
        expect(refreshTokens[0]).not.toBe('');
    })
    it("Return sessions for user, GET /hometask_09/api/security/devices",async ()=>{
        refreshTokens = await setupUserWithSessions();

        const response = await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);
    });
    it("Shouldn't return session for user with invalid token(401), GET /hometask_09/api/security/devices", async ()=>{
        const testUser2 = await createUser(app, {
            login: "PchelaMaya",
            password: "pchela123",
            email: "testpchala@gmail.com"
        });

        const loginResponse = await request(app)
            .post(`${AUTH_PATH}/login`)
            .send({
                loginOrEmail: "PchelaMaya",
                password: "pchela123"
            });

        const expiredToken = createExpiredToken(testUser2.id);

        const response = await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', `refreshToken=${expiredToken}`)
            .expect(HttpStatus.Unauthorized);
    });
    it("Shouldn't return session for unauthorised user(401), GET /hometask_09/api/security/devices", async ()=>{
        const response = await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .expect(HttpStatus.Unauthorized);
    });
    it("Should upadate refreshToken device 1", async () => {
        refreshTokens = await setupUserWithSessions();
        const oldSessionsResponse =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);
        const oldSessions = oldSessionsResponse.body;

      const response =  await request(app)
          .post(`${AUTH_PATH}/refresh-token`)
          .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
          .expect(HttpStatus.Ok);

        expect(response.status).toBe(HttpStatus.Ok);
        expect(response.body).toHaveProperty('accessToken');

        const cookies = response.headers['set-cookie'] || response.headers['Set-Cookie'];
        if (cookies && cookies[0]) {
            refreshTokens[0] = cookies[0].split(';')[0].split('=')[1];
        }

        const result = await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(result.body).toHaveLength(4);
        for (let i=0; i<result.body.length; i++) {
            expect(result.body[i].deviceId).toEqual(oldSessionsResponse.body[i].deviceId);
        }
        expect(result.body[0].lastActiveDate).not.toEqual(oldSessionsResponse.body[0].lastActiveDate)
    })
    it("Should delete device 2, DELETE /hometask_09/api/security/devices/{deviceId}", async () => {
        refreshTokens = await setupUserWithSessions();
        const response =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);

        const deviceId = response.body[1].deviceId;
        const deleteResult = await request(app)
            .delete(`${SECURITY_PATH}/devices/${deviceId}`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.NoContent);
        const result = await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(result.body).toHaveLength(3);

       const del =result.body.find((item: SessionOutput) => item.deviceId === deviceId);
       expect(del).toBeUndefined();
    })
    it("Shouldn't delete device 2 with not valid refresh token(401), DELETE /hometask_09/api/security/devices/{deviceId}", async () => {
        const testUser2 = await createUser(app, {
            login: "PchelaMaya",
            password: "pchela123",
            email: "testpchala@gmail.com"
        });

        const loginResponse = await request(app)
            .post(`${AUTH_PATH}/login`)
            .send({
                loginOrEmail: "PchelaMaya",
                password: "pchela123"
            });

        refreshTokens = await setupUserWithSessions();

        const response =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);
        const deviceId = response.body[1].deviceId;

        const expiredToken = createExpiredToken(testUser2.id);

        const deleteResult = await request(app)
            .delete(`${SECURITY_PATH}/devices/${deviceId}`)
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(HttpStatus.Unauthorized);

        const response2 =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response2.body).toHaveLength(4);
    })
    it("Shouldn't delete device with not valid id(404), DELETE /hometask_09/api/security/devices/{deviceId}", async () => {
        refreshTokens = await setupUserWithSessions();

        const response =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);
        const deviceId = randomUUID();

        const deleteResult = await request(app)
            .delete(`${SECURITY_PATH}/devices/${deviceId}`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.NotFound);

        const response2 =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response2.body).toHaveLength(4);
    })
    it("Shouldn't delete device 2 with valid refresh token another user(403), DELETE /hometask_09/api/security/devices/{deviceId}", async () => {
        const testUser2 = await createUser(app, {
            login: "PchelaMaya",
            password: "pchela123",
            email: "testpchala@gmail.com"
        });

        const loginResponse = await request(app)
            .post(`${AUTH_PATH}/login`)
            .send({
                loginOrEmail: "PchelaMaya",
                password: "pchela123"
            });
        const cookies = loginResponse.headers['set-cookie'] || loginResponse.headers['Set-Cookie'];
        let refreshToken;
        if (cookies && cookies[0]) {
           refreshToken = cookies[0].split(';')[0].split('=')[1];
        }

        refreshTokens = await setupUserWithSessions();

        const response =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);
        const deviceId = response.body[1].deviceId;

        const deleteResult = await request(app)
            .delete(`${SECURITY_PATH}/devices/${deviceId}`)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(HttpStatus.Forbidden);

        const response2 =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response2.body).toHaveLength(4);
    })
    // Делаем logout девайсом 3. Запрашиваем список девайсов (девайсом 1).  В списке не должно быть девайса 3;
    it("should logout device POST /hometask_09/api/auth/logout", async () => {
        refreshTokens = await setupUserWithSessions();
        const response =  await request(app)
            .get(`${SECURITY_PATH}/devices`)
            .set('Cookie', [`refreshToken=${refreshTokens[0]}`])
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveLength(4);


    })
})