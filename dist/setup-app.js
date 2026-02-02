"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApp = void 0;
const express_1 = __importDefault(require("express"));
const blogs_router_1 = require("./blogs/routes/blogs.router");
const posts_router_1 = require("./posts/routes/posts.router");
const testing_router_1 = require("./testing/routes/testing.router");
const paths_1 = require("./core/paths/paths");
const http_statuses_1 = require("./core/types/http-statuses");
const user_router_1 = require("./users/routes/user.router");
const auth_router_1 = require("./auth/routes/auth.router");
const comments_router_1 = require("./comments/routes/comments.router");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const setupApp = (app) => {
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.get('/', (req, res) => {
        res.status(http_statuses_1.HttpStatus.Ok).send('hello world!');
    });
    app.use(paths_1.BLOGS_PATH, blogs_router_1.blogsRouter);
    app.use(paths_1.POSTS_PATH, posts_router_1.postsRouter);
    app.use(paths_1.TESTING_PATH, testing_router_1.testingRouter);
    app.use(paths_1.AUTH_PATH, auth_router_1.authRouter);
    app.use(paths_1.USERS_PATH, user_router_1.usersRouter);
    app.use(paths_1.COMMENTS_PATH, comments_router_1.commentsRouter);
    console.log('✅ Routers initialized:'); // 🔥
    console.log('- Blogs:', paths_1.BLOGS_PATH);
    console.log('- Posts:', paths_1.POSTS_PATH);
    console.log('- Users:', paths_1.USERS_PATH);
    console.log('- Auth:', paths_1.AUTH_PATH);
    console.log('- Comments:', paths_1.COMMENTS_PATH);
    console.log('- Testing:', paths_1.TESTING_PATH);
    return app;
};
exports.setupApp = setupApp;
//# sourceMappingURL=setup-app.js.map