import {CommentInputDto} from "./dtos/comment.input-dto";
import {ResultStatus} from "../../core/result/result.code";
import {Result, ResultObject} from "../../core/result/result.type";
import {CommentDB} from "../routes/output/commnent.db";
import {DeleteResult, UpdateResult, WithId} from "mongodb";
import {CommentOutput} from "../routes/output/comment-output";
import {Post} from "../../posts/domain/post";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentsRepository} from "../repositories/comments.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import { inject, injectable } from 'inversify';
import {PostDocument} from "../../posts/domain/post.entity";
import {CommentDocument} from "../domain/comment.entity";

@injectable()
export class CommentsService {
    commentsRepository: CommentsRepository;
    postsRepository: PostsRepository;

    constructor(
        @inject(CommentsRepository) commentsRepository: CommentsRepository,
        @inject(PostsRepository) postsRepository: PostsRepository
    ) {
        this.commentsRepository = commentsRepository;
        this.postsRepository = postsRepository;
    }

    async createComment(postId: string, userId: string, dto: CommentInputDto): Promise<Result<CommentOutput|null>> {
        let post: PostDocument | null;
        try{
            post = await this.postsRepository.findPostByIdOrFail(postId);
        } catch (error) {
            if (error instanceof RepositoryNotFoundError) {
                return ResultObject.NotFound('postId', 'Post with this Id is not exist');
            }
            console.error('Error finding post:', error);
            return ResultObject.InternalServerError( 'Error finding post');
        }
        
        if (!post) {
            return ResultObject.NotFound('postId', 'Post with this Id is not exist');
        }
        const newComment: CommentDB = {
            content: dto.content,
            userId,
            postId,
            createdAt: new Date().toISOString(),
        }
        const createdCommentId: string = await this.commentsRepository.createComment(newComment);
        const createdComment: CommentDocument = await this.commentsRepository.findCommentById(createdCommentId);
        const createdCommentOutput: CommentOutput = await this.commentsRepository.mapToCommentOutput(createdComment);
        return ResultObject.Created(createdCommentOutput);
    }
    async updateComment(commentId: string, userId: string, dto: CommentInputDto): Promise<Result> {
        const checkResult = await this.checkUserId(userId, commentId);
        if(checkResult.status === ResultStatus.Forbidden||checkResult.status === ResultStatus.NotFound) {
            return checkResult;
        }
        const comment: CommentDocument = await this.commentsRepository.findCommentById(commentId);
        if (!comment) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        comment.content= dto.content;
        try{
            await this.commentsRepository.save(comment);
        } catch (error) {
            return ResultObject.InternalServerError('Comment wasn\'t update');
        }
        return ResultObject.NoContent();
    }
    async deleteComment(userId: string, commentId: string): Promise<Result> {
       const checkResult = await this.checkUserId(userId, commentId);
       if(checkResult.status === ResultStatus.Forbidden||checkResult.status === ResultStatus.NotFound) {
           return checkResult;
       }
        const result: DeleteResult = await this.commentsRepository.deleteComment(commentId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        return ResultObject.NoContent();
    }
    async checkUserId(userId: string, commentId: string): Promise<Result> {
        const comment = await this.commentsRepository.findCommentById(commentId);
        if (!comment) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        if (comment.userId !== userId) {
            return ResultObject.Forbidden();
        }
        return ResultObject.Success(null);
    }
}
