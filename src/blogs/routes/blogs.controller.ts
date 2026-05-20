import {Response, Request} from "express";
import {BlogQueryInput} from "./input/blog-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../core/helpers/set-default-sort-and-pagination";
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {PostQueryInput} from "../../posts/routes/input/post-query.input";
import {BlogsQueryRepository} from "../repositories/blogs.query-repository";
import {BlogsService} from "../application/blog.service";
import {PostsQueryRepository} from "../../posts/repositories/posts.query-repository";
import {PostsService} from "../../posts/application/post.services";
import { inject, injectable } from 'inversify';

@injectable()
export class BlogsController {
    blogsQueryRepository: BlogsQueryRepository;
    blogsService: BlogsService;
    postsQueryRepository: PostsQueryRepository;
    postsService: PostsService;

    constructor(
        @inject(BlogsQueryRepository) blogsQueryRepository: BlogsQueryRepository,
        @inject(BlogsService) blogsService: BlogsService,
        @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
        @inject(PostsService) postsService: PostsService,
    ) {
        this.blogsQueryRepository = blogsQueryRepository;
        this.blogsService = blogsService;
        this.postsQueryRepository = postsQueryRepository;
        this.postsService = postsService;
    }

    async getBlogList(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query as unknown as BlogQueryInput;
            const sanitizedQuery = matchedData<BlogQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });//утилита для извечения трансформированных значений после валидатара
            //в req.query остаются сырые квери параметры (строки)
            const queryInput = setDefaultSortAndPaginationIfNotExist({...query, ...sanitizedQuery});
            const {items, totalCount} = await this.blogsQueryRepository.findManyBlogs(queryInput);
            const blogsListOutput = this.blogsQueryRepository.mapToBlogListPaginatedOutput(items,
                queryInput.pageNumber,
                queryInput.pageSize,
                totalCount,
            )
            res.status(HttpStatus.Ok).send(blogsListOutput);
        } catch (error: unknown) {
            errorHandler(error, res);
        }
    }
    async getBlog(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;

            const blog = await this.blogsQueryRepository.findBlogByIdOrFail(id);
            const blogOutput = this.blogsQueryRepository.mapToBlogOutput(blog);
            res.status(HttpStatus.Ok).send(blogOutput);
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async createBlog(req: Request, res: Response): Promise<void> {
        try{
            const createdBlogId = await this.blogsService.create(req.body);
            const createdBlog = await this.blogsQueryRepository.findBlogByIdOrFail(createdBlogId);
            const blogOutput = this.blogsQueryRepository.mapToBlogOutput(createdBlog);
            res.status(HttpStatus.Created).send(blogOutput);

        } catch(err: unknown){
            errorHandler(err, res);
        }
    }
    async updateBlog(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            await this.blogsService.update(id, req.body);
            res.sendStatus(HttpStatus.NoContent);
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async deleteBlog(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            await this.blogsService.delete(id);
            res.sendStatus(HttpStatus.NoContent)
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async getBlogPostList(req: Request, res: Response): Promise<void> {
        try {
            const blogId = req.params.id as string;
            const queryInput = req.query as unknown as unknown as PostQueryInput;
            const sanitizedQuery = matchedData<PostQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const userId = req.userId;
            const { items, totalCount } = await this.postsQueryRepository.findPostsByBlogId(blogId, sanitizedQuery);
            const postListOutput = await this.postsQueryRepository.mapToPostListPaginatedOutput(items,
                sanitizedQuery.pageNumber,
                sanitizedQuery.pageSize,
                totalCount,
                userId,
            );
            res.status(HttpStatus.Ok).send(postListOutput);
        }
        catch (e: unknown) {
            errorHandler(e,res);
        }
    }
    async createBlogPost(req: Request, res: Response): Promise<void> {
        try{
            const blogId = req.params.id as string;
            const blog = await this.blogsQueryRepository.findBlogByIdOrFail(blogId);
            const postData = req.body;
            const createdPostId = await this.postsService.createPost({
                title: postData.title,
                shortDescription: postData.shortDescription,
                content: postData.content,
                blogId});
            const createdPost = await this.postsQueryRepository.findPostByIdOrFail(createdPostId);
            const postOutput = await this.postsQueryRepository.mapToPostOutput(createdPost);
            res.status(HttpStatus.Created).send(postOutput);
        }
        catch (e: unknown) {
            errorHandler(e,res);
        }
    }
}
