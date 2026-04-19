import express, {Express} from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {createUser} from "../../utils/users/create-user";
import {getUserDto} from "../../utils/users/get-user-dto";
import request from "supertest";
import {USERS_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {UserOutput} from "../../../src/users/routes/output/user-output";

describe( "Users API", ()=>{
    const app: Express = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        //await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app);
    });
    afterAll(async () => {
       await stopDb();
    });
    it( "should create a user; POST /hometask_05/api/users" , async () => {
        await createUser(app, {
            ...getUserDto(),
            login: '5aE2_2c8OJ',
            email: 'example@example.dev',
        });
    });
    it( "should get users; GET /hometask_05/api/users" , async () => {
        await createUser(app, {
            ...getUserDto(),
            login: 'Diana',
            email: 'sdfs@example.dev',
        });
        await createUser(app, {
            ...getUserDto(),
            login: '5aE2Di49',
            email: 'gdgj@mail.ru',
            password: '12345678',
        });

        const userListResponse = await request(app)
            .get(USERS_PATH)
            .set('Authorization', generateBasicAuthToken())
            .expect(HttpStatus.Ok);

        expect(userListResponse.body.items).toBeInstanceOf(Array);
        expect(userListResponse.body.items.length).toBeGreaterThanOrEqual(2);
    });
    it( "should delete user; DELETE /hometask_05/api/users/:id" , async () => {
        const newUser = await createUser(app, {
            ...getUserDto(),
            login: 'newLogin',
            email: 'newEmail@mail.ru',
        });
        await request(app)
            .delete(`${USERS_PATH}/${newUser.id}`)
            .set('Authorization', generateBasicAuthToken())
            .expect(HttpStatus.NoContent);
        const userListResponse = await request(app)
            .get(USERS_PATH)
            .set('Authorization', generateBasicAuthToken())
            .expect(HttpStatus.Ok);

        expect(userListResponse.body.items).toBeInstanceOf(Array);
        const deletedUserInList = userListResponse.body.items.find((user: UserOutput) => user.id === newUser.id);
        expect(deletedUserInList).toBeUndefined();
    });
    it("should return blogs list with pagination, sorting: GET /hometask_05/api/users", async () => {
        for(let i=0; i<15; i++) {
            await createUser(app, {
                ...getUserDto(),
                "login": `5aE2c8J${i}`,
                "password": `1234567${i}8`,
                "email": `fs${i}s@mail.com`,
            });
        }
        const response = await request(app)
            .get(USERS_PATH)
            .set('Authorization', generateBasicAuthToken())
            .query({
                "pageNumber": 1,
                "pageSize": 10,
                "sortBy": 'id',
                "sortDirection": 'asc',
            })
            .expect(HttpStatus.Ok);
        expect(response.body).toHaveProperty('page',1);
        expect(response.body).toHaveProperty('pageSize', 10);
        expect(response.body).toHaveProperty('pagesCount');
        expect(response.body).toHaveProperty('totalCount', 15);
        expect(response.body.items).toHaveLength(10);
    });
    it("should return blogs list with pagination, sorting and search by login: GET /hometask_05/api/users", async () => {
        for(let i=0; i<15; i++) {
            await createUser(app, {
                ...getUserDto(),
                login: `5aE2c8J${i}`,
                password: `1234567${i}8`,
                email: `fs${i}s@mail.com`,
            });
        }
        await createUser(app, {
            ...getUserDto(),
            login: `5adifss`,
            password: `1234567s8`,
            email: `fss@mail.com`,
        });
        await createUser(app, {
            ...getUserDto(),
            login: `5dianfss`,
            password: `1234567s8`,
            email: `fssad@mail.com`,
        });
        const response = await request(app)
            .get(USERS_PATH)
            .set('Authorization', generateBasicAuthToken())
            .query({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'id',
                sortDirection: 'asc',
                searchLoginTerm: `di`,
            })
            .expect(HttpStatus.Ok);
        expect(response.body).toHaveProperty('page',1);
        expect(response.body).toHaveProperty('pageSize', 10);
        expect(response.body).toHaveProperty('pagesCount');
        expect(response.body).toHaveProperty('totalCount', 2);
        expect(response.body.items).toHaveLength(2);
    });
    it("should return blogs list with pagination, sorting and search by email: GET /hometask_05/api/users", async () => {
        for(let i=0; i<15; i++) {
            await createUser(app, {
                ...getUserDto(),
                login: `5aE2c8J${i}`,
                password: `1234567${i}8`,
                email: `fs${i}s@mail.com`,
            });
        }
        await createUser(app, {
            ...getUserDto(),
            login: `5adifss`,
            password: `1234567s8`,
            email: `fssdi@mail.com`,
        });
        await createUser(app, {
            ...getUserDto(),
            login: `5dianfss`,
            password: `1234567s8`,
            email: `fssadi@mail.com`,
        });
        const response = await request(app)
            .get(USERS_PATH)
            .set('Authorization', generateBasicAuthToken())
            .query({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'id',
                sortDirection: 'asc',
                searchEmailTerm: `di`,
            })
            .expect(HttpStatus.Ok);
        expect(response.body).toHaveProperty('page',1);
        expect(response.body).toHaveProperty('pageSize', 10);
        expect(response.body).toHaveProperty('pagesCount');
        expect(response.body).toHaveProperty('totalCount', 2);
        expect(response.body.items).toHaveLength(2);
    });
})