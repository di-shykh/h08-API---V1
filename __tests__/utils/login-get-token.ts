import {createUser} from "./users/create-user";
import {getUserDto} from "./users/get-user-dto";
import request from "supertest";
import {AUTH_PATH} from "../../src/core/paths/paths";
import {HttpStatus} from "../../src/core/types/http-statuses";
import express, {Express} from "express";
import {setupApp} from "../../src/setup-app";
import {UserInputDto} from "../../src/users/application/dtos/user.input-dto";

export const loginGetToken = async (app: Express, userDto?: UserInputDto) => {

    const timestamp = Date.now().toString().slice(0,4);
    const userData = {
        login: userDto?.login ?? `TestUser1`,
        password: userDto?.password ?? 'password123',
        email: userDto?.email ?? `test1@example.com`
    };

    const user= await createUser(app, userData);

    // Пробуем авторизоваться - сначала с логином, потом с email
    let response = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: userData.login, password: userData.password })
        .expect(HttpStatus.Ok);

    // Если не получилось с логином, пробуем с email
    if (!response.body.accessToken) {
        response = await request(app)
            .post(`${AUTH_PATH}/login`)
            .send({ loginOrEmail: userData.email, password: userData.password })
            .expect(HttpStatus.Ok);
    }

    return response.body.accessToken;
};