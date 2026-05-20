import {Request, Response} from "express";
import {PostQueryInput} from "./input/post-query.input";
import {matchedData} from "express-validator";
import {setDefaultSortAndPaginationIfNotExist} from "../../core/helpers/set-default-sort-and-pagination";
import {HttpStatus} from "../../core/types/http-statuses";
import {errorHandler} from "../../core/errors/error.handler";
import {CommentInputDto} from "../../comments/application/dtos/comment.input-dto";
import {Result, ResultObject} from "../../core/result/result.type";
import {CommentOutput} from "../../comments/routes/output/comment-output";
import {ResultStatus} from "../../core/result/result.code";
import {resultCodeToHttpException} from "../../core/result/resultCodeToHttpExeptions";
import {CommentQueryInput} from "../../comments/routes/input/comment-query.input";
import {CommentListPaginatedOutput} from "../../comments/routes/output/comment-list-paginated.output";
import {PostsQueryRepository} from "../repositories/posts.query-repository";
import {PostsService} from "../application/post.services";
import {CommentsService} from "../../comments/application/comment.services";
import {CommentsQueryRepository} from "../../comments/repositories/comments.query-repository";
import { inject, injectable } from 'inversify';
import {PostDocument} from "../domain/post.entity";
import {LikeStatus} from "../../likes/types/likeStatus";

@injectable()
export class PostsController {
    postsQueryRepository: PostsQueryRepository;
    postsService: PostsService;
    commentsService: CommentsService;
    commentsQueryRepository: CommentsQueryRepository;

    constructor(
        @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
        @inject(PostsService) postsService: PostsService,
        @inject(CommentsService) commentsService: CommentsService,
        @inject(CommentsQueryRepository) commentsQueryRepository: CommentsQueryRepository
    ) {
        this.postsQueryRepository = postsQueryRepository;
        this.postsService = postsService;
        this.commentsService = commentsService;
        this.commentsQueryRepository = commentsQueryRepository;
    }

    async getPostList(req: Request, res: Response) {
        try{
            const query = req.query as unknown as PostQueryInput;
            const userId = req.userId;
            const sanitizedQuery = matchedData<PostQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);
            const {items, totalCount} = await this.postsQueryRepository.findManyPosts(queryInput);
            const postsListOutput = await this.postsQueryRepository.mapToPostListPaginatedOutput(items,
                queryInput.pageNumber,
                queryInput.pageSize,
                totalCount,
                userId
            )
            res.status(HttpStatus.Ok).send(postsListOutput);
        }catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async getPost(req: Request, res: Response) {
        try{
            const id = req.params.id as string;
            const userId = req.userId;
            const post = await this.postsQueryRepository.findPostByIdOrFail(id);
            const postOutput = await this.postsQueryRepository.mapToPostOutput(post, userId);
            res.status(HttpStatus.Ok).send(postOutput);
        } catch (e: unknown ) {
            errorHandler(e, res);
        }
    }
    async createPost(req: Request, res: Response) {
        try{
            const createdPost = await this.postsService.createPost(req.body);
            const insertedPost = await this.postsQueryRepository.findPostByIdOrFail(createdPost);
            const postOutput = await this.postsQueryRepository.mapToPostOutput(insertedPost, req.userId);
            res.status(HttpStatus.Created).send(postOutput);
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async updatePost(req: Request, res: Response) {
        try{
            const id = req.params.id as string;
            const updatedPost = await this.postsService.updatePost(id, req.body);
            res.sendStatus(HttpStatus.NoContent);
        } catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async deletePost(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await this.postsService.deletePost(id);
            res.sendStatus(HttpStatus.NoContent);
        }catch (e: unknown) {
            errorHandler(e, res);
        }
    }
    async createComment(req: Request, res: Response) {
        try{
            const postId: string = req.params.id as string;
            const post: PostDocument= await this.postsQueryRepository.findPostByIdOrFail(postId);
            const commentInput: CommentInputDto = req.body;
            const userId: string = req.userId as string;

            const result: Result<CommentOutput|null> = await this.commentsService.createComment(postId, userId, commentInput);

            if(result.status!== ResultStatus.Created){
                res.status(resultCodeToHttpException(result.status)).json({
                    errorsMessages: result.extensions
                });
                return;
            }
            res.status(HttpStatus.Created).json(result.data);
        } catch (e) {
            errorHandler(e,res);
        }
    }
    async getCommentList(req: Request, res: Response) {
        try{
            const paramPostId = req.params.id as string;
            const userId: string = req.userId as string;

            if (!paramPostId) {
                return res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [{ message: "Post ID is required", field: "id" }]
                });
            }

            const post = await this.postsQueryRepository.findPostByIdOrFail(paramPostId);
            if (!post) {
                return res.status(HttpStatus.NotFound).json({
                    errorsMessages: [{ message: "Post not found", field: "id" }]
                });
            }

            const query = req.query as unknown as CommentQueryInput;
            const sanitizedQuery = matchedData<CommentQueryInput>(req, {
                locations: ['query'],
                includeOptionals: true,
            });
            const postId = paramPostId /*|| sanitizedQuery.postId;*/
            const queryInput = setDefaultSortAndPaginationIfNotExist({
                ...sanitizedQuery,
            });

            const {items, totalCount} = await this.commentsQueryRepository.findManyComments(queryInput, postId);

            const commentsListOutput: CommentListPaginatedOutput = await this.commentsQueryRepository.mapToCommentListOutput(items,
                queryInput.pageNumber,
                queryInput.pageSize,
                totalCount,
                userId
            )
            const result = ResultObject.Success(commentsListOutput);
            res.status(HttpStatus.Ok).json(result.data)
        } catch (e) {
            errorHandler(e, res);
        }
    }
    async changeExtendedLikeStatus(req: Request, res: Response) {
       try {
           const postId: string = req.params.id as string;
           const userId: string | undefined = req.userId;
           const likeStatus: LikeStatus =  req.body.likeStatus;

           if(!userId){
               res.status(HttpStatus.Unauthorized).json({
                   errorsMessages: [{ message: "User not authorized", field: "authorization" }]
               })
               return;
           }
           if(!likeStatus || !Object.values(LikeStatus).includes(likeStatus)){
               res.status(HttpStatus.BadRequest).json({
                   errorsMessages: [{ message: "Invalid likeStatus", field: "likeStatus" }]
               })
               return;
           }
           const result = await this.postsService.changeExtendedLikeStatus(postId, userId, likeStatus);
           if(result.status !== ResultStatus.NoContent){
               res.status(resultCodeToHttpException(result.status)).json({
                   errorsMessages: result.extensions
               })
               return;
           }
           return res.sendStatus(HttpStatus.NoContent);
       } catch (e) {
           errorHandler(e, res);
       }
    }
}
