import express from "express";
import {setupApp} from "../../../src/setup-app";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {loginGetToken} from "../../utils/login-get-token";
import {createComment} from "../../utils/comments/create-comment";
import {createPost} from "../../utils/posts/create-post";
import request from "supertest";
import {COMMENTS_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {ObjectId} from "mongodb";

describe("Comments API", () => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        // await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app); // Переместите сюда
    });
    afterAll(async () => {
        await stopDb();
    })
    it('should get comment: GET /hometask_06/api/comments/{id}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body).toHaveProperty('id', comment.id);
        expect(result.body).toHaveProperty('content', 'test content for e2e tests');
        expect(result.body).toHaveProperty('commentatorInfo');
        expect(result.body).toHaveProperty('createdAt');

        expect(typeof result.body.id).toBe('string');
        expect(typeof result.body.createdAt).toBe('string');
        expect(typeof result.body.commentatorInfo.userId).toBe('string');
        expect(typeof result.body.commentatorInfo.userLogin).toBe('string');
        expect(new Date(result.body.createdAt).toISOString()).toBe(result.body.createdAt);

        expect(result.body.id).not.toBe('');
        expect(result.body.content).not.toBe('');
        expect(result.body.commentatorInfo.userId).not.toBe('');
        expect(result.body.commentatorInfo.userLogin).not.toBe('');
    })
    it('should not get comment with wrong id: GET /hometask_06/api/comments/{id}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});
        const notExistingCommentId = new ObjectId().toString();

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${notExistingCommentId}`)
            .expect(HttpStatus.NotFound);
    })
    it('should update comment, PUT /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

         await request(app)
            .put(`${COMMENTS_PATH}/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "updated test content for e2e tests"})
            .expect(HttpStatus.NoContent);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.content).toBe('updated test content for e2e tests');
    })
    it('should not update comment with wrong id, PUT /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});
        const notExistingCommentId = new ObjectId().toString();

        await request(app)
            .put(`${COMMENTS_PATH}/${notExistingCommentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "updated test content for e2e tests"})
            .expect(HttpStatus.NotFound);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.content).toBe('test content for e2e tests');
    })
    it('should not update comment with invalid content, PUT /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        await request(app)
            .put(`${COMMENTS_PATH}/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "test"})
            .expect(HttpStatus.BadRequest);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.content).toBe('test content for e2e tests');
    })
    it('should not update comment without valid token, PUT /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        await request(app)
            .put(`${COMMENTS_PATH}/${comment.id}`)
            .send({content: "test"})
            .expect(HttpStatus.Unauthorized);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.content).toBe('test content for e2e tests');
    })
    it('should not update comment with invalid token, PUT /hometask_06/api/comments/{commentId}', async () => {

        //этот тест падает
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});
        // console.log(comment);
        // console.log('token:'+token);
console.log("created comment in comment it", comment);
        const anotherToken = await loginGetToken(app, {login: 'AnotherUser23', password: 'anotherPassword23', email: 'anotherEmail@gmail.com'});
        console.log('anotherToken:'+anotherToken);
        await request(app)
            .put(`${COMMENTS_PATH}/${comment.id}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .send({content: "test"})
            .expect(HttpStatus.Forbidden);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.content).toBe('test content for e2e tests');
    })
    it('should delete comment, DELETE /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        await request(app)
            .delete(`${COMMENTS_PATH}/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NoContent);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.NotFound);
    })
    it('should not delete comment with wrong id, DELETE /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});
        const notExistingId = new ObjectId().toString();

        await request(app)
            .delete(`${COMMENTS_PATH}/${notExistingId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(HttpStatus.NotFound);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);

        expect(result.body.id).toBe(comment.id);
        expect(result.body.content).toBe("test content for e2e tests");
    })
    it('should not delete comment without token, DELETE /hometask_06/api/comments/{commentId}', async () => {
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        await request(app)
            .delete(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Unauthorized);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);
    })
    it('should not delete comment with another token, DELETE /hometask_06/api/comments/{commentId}', async () => {
        //этот тест падает
        const token = await loginGetToken(app);
        const createdPost = await createPost(app);
        const comment = await createComment(app, token, createdPost.id, {content: "test content for e2e tests"});

        const anotherToken = await loginGetToken(app, {
            login: 'AnotherUser',
            email: 'anotheruser@gmail',
            password: 'anotherPassword',
        });

        await request(app)
            .delete(`${COMMENTS_PATH}/${comment.id}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .expect(HttpStatus.Forbidden);

        const result = await request(app)
            .get(`${COMMENTS_PATH}/${comment.id}`)
            .expect(HttpStatus.Ok);
    })
})