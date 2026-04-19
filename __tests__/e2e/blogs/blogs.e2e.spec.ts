import request from "supertest";
import {setupApp} from "../../../src/setup-app";
import express from "express";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {BLOGS_PATH} from "../../../src/core/paths/paths";
import {clearDb} from "../../utils/clear-db";
import {runDB, stopDb} from "../../../src/db/mongo.bd";
import {SETTINGS} from "../../../src/core/settings/settings";
import {getBlogDto} from "../../utils/blogs/get-blog-dto";
import {createBlog} from "../../utils/blogs/create-blog";
import {getBlogById} from "../../utils/blogs/get-blog-by-id";
import {updateBlog} from "../../utils/blogs/update-blog";
import {BlogAttributes} from "../../../src/blogs/application/dtos/blog-attributes";
import {PostOutput} from "../../../src/posts/routes/output/post-output";
import {createBlogPost} from "../../utils/blogs/create-blog-post";
import {getBlogPosts} from "../../utils/blogs/get-blog-post";


describe("Blogs API", () => {
    const app = express();
    setupApp(app);
    const adminToken: string = generateBasicAuthToken();
    beforeAll(async () => {
        await runDB(SETTINGS.MONGO_URL_TEST)
        //await clearDb(app);
    });
    beforeEach(async () => {
        await clearDb(app);
    });
    afterAll(async () => {
       await stopDb();
    })
    it('should create blog; POST /hometask_04/api/blogs', async () => {

       await createBlog(app, {
            ...getBlogDto(),
            name: "Blog name New",
            description: "Blog description New",
            websiteUrl: "https://www.blogsNew.com/"
        });
    });
    it('should return blogs list: GET /hometask_04/api/blogs', async () => {
        await createBlog(app,{...getBlogDto(), name: "Blog name New2", description: "Blog description New2"} );
        await createBlog(app, {...getBlogDto(), name: "Blog name New3", description: "Blog description New3"});

        const blogListResponse = await request(app)
            .get(BLOGS_PATH)
            .set('Authorization', adminToken)
            .expect(HttpStatus.Ok);

        expect(blogListResponse.body.items).toBeInstanceOf(Array);
        expect(blogListResponse.body.items.length).toBeGreaterThanOrEqual(2);

    });

    it('should return blog by id; GET /hometask_04/api/blogs/:id',async () => {
        const createRespose = await createBlog(app);
        const blog = await getBlogById(app, createRespose.id);
        expect(blog).toEqual({
            ...createRespose,
            id: expect.any(String),
            createdAt: expect.any(String),
        });
    });
    it('should update blog; PUT /hometask_04/api/blogs/:id',async () => {
        const createRespose = await createBlog(app, {...getBlogDto(),name: "Another Blog", description: "Another Blog description"})

        const blogUpdateData: BlogAttributes = {
            name: "Updated name",
            description: "Updated description",
            websiteUrl: "https://www.updateblogs.com/",
        };
        await updateBlog(app, createRespose.id, blogUpdateData);

        const blogResponse = await getBlogById(app, createRespose.id);
        expect(blogResponse).toEqual({
            ...blogUpdateData,
            id: createRespose.id,
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
        });
    });
    it('DELETE /hometask_04/api/blogs/:id and check after NOT FOUND',async () => {
          const createdBlog = await createBlog(app);

          await request(app)
            .delete(`${BLOGS_PATH}/${createdBlog.id}`)
            .set('Authorization', adminToken)
            .expect(HttpStatus.NoContent);

          await request(app)
            .get(`${BLOGS_PATH}/${createdBlog.id}`)
            .set('Authorization', adminToken);
            expect(HttpStatus.NotFound);
    });
    it('POST /hometask_04/api/blogs/{blogId}/posts', async () => {
        const createRespose = await createBlog(app);
        const blog = await getBlogById(app, createRespose.id);
        const createdPost: PostOutput = await createBlogPost(app, blog.id, {
           title: 'Blog_Post Title',
           shortDescription: 'description blog_post',
           content: 'constent blog_post',
            blogId: blog.id,
        });
    })
    it('GET /hometask_04/api/blogs/{blogId}/posts', async () => {
        const createRespose = await createBlog(app);
        const blog = await getBlogById(app, createRespose.id);
        await Promise.all([
                createBlogPost(app, blog.id, {
                title: 'Blog_Post Title',
                shortDescription: 'description blog_post',
                content: 'constent blog_post',
                blogId: blog.id,
            }),
            createBlogPost(app, blog.id, {
                title: 'Blog_Post Title2',
                shortDescription: 'description blog_post2',
                content: 'constent blog_post2',
                blogId: blog.id,
            }),
            createBlogPost(app, blog.id, {
                title: 'Blog_Post Title3',
                shortDescription: 'description blog_post3',
                content: 'constent blog_post3',
                blogId: blog.id,
            }),
        ]);
        const postsResponse = await getBlogPosts(app, blog.id);
        const posts = postsResponse.items || postsResponse;
        expect(posts.length).toBeGreaterThanOrEqual(3);
        expect(posts).toBeInstanceOf(Array);
    })
    it('should return blogs list with pagination, sorting: GET /hometask_04/api/blogs/', async () => {
        await clearDb(app);
        await createBlog(app, {
            ...getBlogDto(),
            name: "Blog name Di",
            description: "Blog description New",
            websiteUrl: "https://www.blogsNew.com/"
        });
        for(let i=0; i<20; i++){
            await createBlog(app, {
                ...getBlogDto(),
                name: `Blog name ${i}`,
            });
        }
        await createBlog(app, {
            ...getBlogDto(),
            name: "Diana's blog",
            description: "Blog description New",
            websiteUrl: "https://www.blogsNew.com/"
        });
        const response = await request(app)
            .get(BLOGS_PATH)
            .set('Authorization', adminToken)
            .query({
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: 'desc',
            })
            .expect(HttpStatus.Ok);

        expect(response.body).toHaveProperty('page',1);
        expect(response.body).toHaveProperty('pageSize', 10);
        expect(response.body).toHaveProperty('pagesCount');
        expect(response.body).toHaveProperty('totalCount', 22);
        expect(response.body.items).toHaveLength(10);

        // Проверяем сортировку по убыванию даты
        const dates = response.body.items.map((item: any) => new Date(item.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i] >= dates[i + 1]).toBe(true);
        }
    })
    it('should return blogs list with pagination, sorting and search by name: GET /hometask_04/api/blogs/', async () => {

        await createBlog(app, {
            ...getBlogDto(),
            name: "Blog name Di",
            description: "Blog description New",
            websiteUrl: "https://www.blogsNew.com/"
        });
        for(let i=0; i<20; i++){
            await createBlog(app, {
                ...getBlogDto(),
                name: `Blog name ${i}`,
            });
        }
        await createBlog(app, {
            ...getBlogDto(),
            name: "Diana's blog",
            description: "Blog description New",
            websiteUrl: "https://www.blogsNew.com/"
        });
        const respose = await request(app)
            .get(BLOGS_PATH)
            .set('Authorization', adminToken)
            .query({
                pageNumber: 1,
                pageSize: 10,
                searchNameTerm: 'Di',
                sortBy: 'createdAt',
                sortDirection: 'desc',
            })
            .expect(HttpStatus.Ok);

        expect(respose.body).toHaveProperty('page',1);
        expect(respose.body).toHaveProperty('pageSize', 10);
        expect(respose.body).toHaveProperty('pagesCount');
        expect(respose.body).toHaveProperty('totalCount', 2);
        expect(respose.body.items).toHaveLength(2);
    })
})
