import request from "supertest";
import {setupApp} from "../../../src/setup-app";
import express from "express";
import {PostInputDto} from "../../../src/posts/application/dtos/post.input-dto";
import {BlogInputDto} from "../../../src/blogs/application/dtos/blog.input-dto";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {POSTS_PATH, BLOGS_PATH} from "../../../src/core/paths/paths";
import {clearDb} from "../../utils/clear-db";
import {runDB,stopDb} from "../../../src/db/mongo.bd";
import {createPost} from "../../utils/posts/create-post";
import {createBlog} from "../../utils/blogs/create-blog";
import {getPostById} from "../../utils/posts/get-post-by-id";
import {SETTINGS} from "../../../src/core/settings/settings";
import {getPostDto} from "../../utils/posts/get-post-dto";
import {updatePost} from "../../utils/posts/update-post";
import {loginGetToken} from "../../utils/login-get-token";
import {CommentInputDto} from "../../../src/comments/application/dtos/comment.input-dto";
import {ObjectId} from "mongodb";
import {createComment} from "../../utils/comments/create-comment";

describe("Posts API", () => {
    const app = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();

    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST);
        // await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app);
    });
    afterAll(async () => {
        await stopDb();
    })
    it('should create blog; POST /hometask_03/api/posts', async () => {
        const blog = await createBlog(app);

        const newPost: PostInputDto = {
            ...getPostDto(blog.id),
            title: "New post title",
            shortDescription: "Post description New",
            content: "new post content",
            blogId: blog.id,
        }

        await createPost(app, newPost);
    });
    it('should return posts list: GET /hometask_03/api/posts', async () => {
        await createPost(app);
        await createPost(app);

        const postListResponse = await request(app)
            .get(POSTS_PATH)
            .set('Authorization', adminToken)
            .expect(HttpStatus.Ok);

        expect(postListResponse.body.items).toBeInstanceOf(Array);
        expect(postListResponse.body.items.length).toBeGreaterThanOrEqual(2);
    });
    it('should return post by id; GET /hometask_03/api/posts/:id',async () => {
        const createdPost = await createPost(app);

        const getPost = await getPostById(app, createdPost.id);

        expect(getPost).toEqual({
            ...createdPost,
            id: expect.any(String),
            createdAt: expect.any(String),
        });
    });
    it('should update post; PUT /hometask_03/api/posts/:id',async () => {
        const post = await createPost(app);

        const postUpdateData: PostInputDto = {
            title: "Another post title",
            shortDescription: "Post description another",
            content: "another post content",
            blogId: post.blogId,
        };

        await updatePost(app, post.id, postUpdateData)

        const postResponse = await getPostById(app, post.id);

        const blogName = postResponse.blogName;
        expect(postResponse).toEqual({
            ...postUpdateData,
            id: postResponse.id,
            blogName: blogName,
            createdAt: postResponse.createdAt,
        });
    });
    it('DELETE /hometask_03/api/posts/:id and check after NOT FOUND',async () => {
          const createdPost = await createPost(app);

          await request(app)
            .delete(`${POSTS_PATH}/${createdPost.id}`)
            .set('Authorization', adminToken)
            .expect(HttpStatus.NoContent);

          const postResponse = await request(app)
            .get(`${POSTS_PATH}/${createdPost.id}`)
            .set('Authorization', adminToken);
        expect(postResponse.status).toBe(HttpStatus.NotFound);
    });
    it('should return posts list with pagination and sorting: GET /hometask_04/api/posts/', async () => {
      const newBlog = await createBlog(app);
        await createPost(app, {
            ...getPostDto(newBlog.id),
            title: 'New post title Di',
        });
        for(let i=0; i<15; i++) {
            await createPost(app, {
                ...getPostDto(newBlog.id),
                title: `New post title ${i}`,
            });
        }
        const response = await request(app)
            .get(POSTS_PATH)
            .set('Authorization', adminToken)
            .query({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: 'desc',
            })
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveProperty('page', 1);
        expect(response.body).toHaveProperty('pageSize', 10);
        expect(response.body).toHaveProperty('pagesCount',2);
        expect(response.body).toHaveProperty('totalCount', 16);
        expect(response.body.items).toHaveLength( 10);

        // Проверяем сортировку по убыванию даты
        const dates = response.body.items.map((item: any) => new Date(item.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i] >= dates[i + 1]).toBe(true);
        }
    })
    it ('should create comment for post, POST /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const post = await createPost(app);

        const response = await request(app)
            .post(`${POSTS_PATH}/${post.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({content: "stringstringstringst"})
            .expect(HttpStatus.Created);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('commentatorInfo');
        expect(response.body).toHaveProperty('createdAt');

        expect(response.body.commentatorInfo).toHaveProperty('userId');
        expect(response.body.commentatorInfo).toHaveProperty('userLogin');

        expect(response.body.content).toBe("stringstringstringst");

        expect(typeof response.body.id).toBe('string');
        expect(typeof response.body.createdAt).toBe('string');
        expect(typeof response.body.commentatorInfo.userId).toBe('string');
        expect(typeof response.body.commentatorInfo.userLogin).toBe('string');
        expect(new Date(response.body.createdAt).toISOString()).toBe(response.body.createdAt);

        expect(response.body.id).not.toBe('');
        expect(response.body.content).not.toBe('');
        expect(response.body.commentatorInfo.userId).not.toBe('');
        expect(response.body.commentatorInfo.userLogin).not.toBe('');
    })
    it('should return 401 if unauthorized, POST /hometask_06/api/posts/{postId}/comments', async () => {
        const post = await createPost(app);

        await request(app)
            .post(`${POSTS_PATH}/${post.id}/comments`)
            .send({ content: "test content" })
            .expect(HttpStatus.Unauthorized);
    });

    it('should return 400 if content is too short, POST /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const post = await createPost(app);

        await request(app)
            .post(`${POSTS_PATH}/${post.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: "short" }) // если есть ограничение по длине
            .expect(HttpStatus.BadRequest);
    });

    it('should return 404 if post not found, POST /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const nonExistentPostId = new ObjectId().toString();

        await request(app)
            .post(`${POSTS_PATH}/${nonExistentPostId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: "test content for e2e tests" })
            .expect(HttpStatus.NotFound);
    });
    it('should return comments for post GET /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const post = await createPost(app);

        for (let i=0; i<11; i++){
           await createComment(app, token, post.id, { content:`content for test comment ${i}_${Date.now().toString()}`})
        }
         const result = await request(app)
             .get(`${POSTS_PATH}/${post.id}/comments`)
             .expect(HttpStatus.Ok);

        expect(result.body).toHaveProperty('page', 1);
        expect(result.body).toHaveProperty('pageSize', 10);
        expect(result.body).toHaveProperty('pagesCount',2);
        expect(result.body).toHaveProperty('totalCount', 11);
        expect(result.body.items).toHaveLength(10);

        expect(result.body.items[0]).toHaveProperty('id');
        expect(result.body.items[0]).toHaveProperty('content');
        expect(result.body.items[0]).toHaveProperty('commentatorInfo');
        expect(result.body.items[0].commentatorInfo).toHaveProperty('userId');
        expect(result.body.items[0].commentatorInfo).toHaveProperty('userLogin');
        expect(result.body.items[0]).toHaveProperty('createdAt');

    })
    it('should not return comments for post with wrong id, return 404: GET /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const post = await createPost(app);
        const notExistPostId = new ObjectId().toString();

        for (let i=0; i<11; i++){
            await createComment(app, token, post.id, { content:`content for test comment ${i}_${Date.now().toString()}`})
        }
        const result = await request(app)
            .get(`${POSTS_PATH}/${notExistPostId}/comments`)
            .expect(HttpStatus.NotFound);
    })
    it('should return 400 for invalid post id format: GET /hometask_06/api/posts/{postId}/comments', async () => {
        const invalidPostId = 'invalid-id-format';

        const result = await request(app)
            .get(`${POSTS_PATH}/${invalidPostId}/comments`)
            .expect(HttpStatus.BadRequest);
    });

    it('should return empty comments list for post without comments: GET /hometask_06/api/posts/{postId}/comments', async () => {
        const token = await loginGetToken(app);
        const post = await createPost(app);

        const result = await request(app)
            .get(`${POSTS_PATH}/${post.id}/comments`)
            .expect(HttpStatus.Ok);

        expect(result.body).toHaveProperty('items');
        expect(result.body.items).toHaveLength(0);
        expect(result.body.totalCount).toBe(0);
        expect(result.body.pagesCount).toBe(0);
    });

})
