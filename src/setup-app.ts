import express, { Express } from 'express';
import { blogsRouter } from './blogs/routes/blogs.router';
import { postsRouter } from './posts/routes/posts.router';
import { testingRouter } from './testing/routes/testing.router';
import {
    POSTS_PATH,
    BLOGS_PATH,
    TESTING_PATH,
    AUTH_PATH,
    USERS_PATH,
    COMMENTS_PATH,
    SECURITY_PATH
} from "./core/paths/paths";
import {HttpStatus} from "./core/types/http-statuses";
import {usersRouter} from "./users/routes/user.router";
import {authRouter} from "./auth/routes/auth.router";
import {commentsRouter} from "./comments/routes/comments.router";
import cookieParser from "cookie-parser";
import {securityRouter} from "./securityDevices/routes/security.router";

export const setupApp = (app: Express) => {
    app.use(express.json());
    app.use(cookieParser());

    app.get('/', (req, res) => {
        res.status(HttpStatus.Ok).send('hello world!');
    });

    app.use(BLOGS_PATH, blogsRouter);
    app.use(POSTS_PATH, postsRouter);
    app.use(TESTING_PATH,testingRouter);
    app.use(AUTH_PATH, authRouter);
    app.use(USERS_PATH, usersRouter);
    app.use(COMMENTS_PATH, commentsRouter);
    app.use(SECURITY_PATH, securityRouter);


    console.log('✅ Routers initialized:'); // 🔥
    console.log('- Blogs:', BLOGS_PATH);
    console.log('- Posts:', POSTS_PATH);
    console.log('- Users:', USERS_PATH);
    console.log('- Auth:', AUTH_PATH);
    console.log('- Comments:', COMMENTS_PATH);
    console.log('- Testing:', TESTING_PATH);
    console.log('- Security:', SECURITY_PATH);

    return app;
}