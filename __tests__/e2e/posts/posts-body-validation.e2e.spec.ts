import request from 'supertest';
import { setupApp } from '../../../src/setup-app';
import express from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { BLOGS_PATH, POSTS_PATH } from '../../../src/core/paths/paths';
import { clearDb } from '../../utils/clear-db';
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {createPost} from "../../utils/posts/create-post";
import {SETTINGS} from "../../../src/core/settings/settings";
import {getPostById} from "../../utils/posts/get-post-by-id";


describe ('Post API body validation check',() => {
    const app = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        await clearDb(app);
    })
    afterAll(async () => {
       await stopDb();
    })
    it('should not create post when incorrect body passed; POST /api/posts', async () => {

        await request(app)
            .post(POSTS_PATH)
            .send({})
            .expect(HttpStatus.Unauthorized);

        const invalidDataSet1 = await request(app)
            .post(POSTS_PATH)
            .set('Authorization', adminToken)
            .send({
                title: "    ",
                shortDescription: "     ",
                content: "   ",
                blogId: "  ",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet1.body.errorsMessages).toHaveLength(4);

        const invalidDataSet2 = await request(app)
            .post(POSTS_PATH)
            .set('Authorization', adminToken)
            .send({
                title: "",
                shortDescription: "",
                content: "",
                blogId: "",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet2.body.errorsMessages).toHaveLength(4);

        const invalidDataSet3 = await request(app)
            .post(POSTS_PATH)
            .set('Authorization', adminToken)
            .send({
                title: "A",
                shortDescription: "A",
                content: "A",
                blogId: "0",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet3.body.errorsMessages).toHaveLength(4);

        //check that nothing were created
        const postResponse = await request(app)
            .get(POSTS_PATH)
            .set('Authorization', adminToken);
        expect(postResponse.body.items).toHaveLength(0);
    });
    it('should not update post when incorrect data passed; PUT /api/posts', async () => {
        const createdPost = await createPost(app);

        const invalidDataSet1 = await request(app)
            .put(`${POSTS_PATH}/${createdPost.id}`)
            .set('Authorization', adminToken)
            .send({
                title: "    ",
                shortDescription: "     ",
                content: "   ",
                blogId: "  ",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet1.body.errorsMessages).toHaveLength(4);

        const invalidDataSet2 = await request(app)
            .put(`${POSTS_PATH}/${createdPost.id}`)
            .set('Authorization', adminToken)
            .send({
                title: "",
                shortDescription: "",
                content: "",
                blogId: "",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet2.body.errorsMessages).toHaveLength(4);

        const invalidDataSet3 = await request(app)
            .put(`${POSTS_PATH}/${createdPost.id}`)
            .set('Authorization', adminToken)
            .send({
                title: "A",
                shortDescription: "A",
                content: "A",
                blogId: "1000",
            })
            .expect(HttpStatus.BadRequest);
        expect(invalidDataSet3.body.errorsMessages).toHaveLength(4);

        const postResponse = await getPostById(app, createdPost.id);

        const blogName = postResponse.blogName;
        expect(postResponse).toEqual({
            ...createdPost,
            id: createdPost.id,
            title: createdPost.title,
            blogName: blogName,
        });
    });
})