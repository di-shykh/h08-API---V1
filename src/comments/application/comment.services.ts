import {CommentInputDto} from "./dtos/comment.input-dto";
import {postsQueryRepository} from "../../posts/repositories/posts.query-repository";
import {ResultStatus} from "../../core/result/result.code";
import {Result, ResultObject} from "../../core/result/result.type";
import {CommentDB} from "../routes/output/commnent.db";
import {commentsRepository} from "../repositories/comments.repository";
import {commentsQueryRepository} from "../repositories/comments.query-repository";
import {DeleteResult, UpdateResult, WithId} from "mongodb";
import {CommentOutput} from "../routes/output/comment-output";
import {Post} from "../../posts/domain/post";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {postsRepository} from "../../posts/repositories/posts.repository";

export const commentsService = {
    async createComment(postId: string, userId: string, dto: CommentInputDto): Promise<Result<CommentOutput|null>> {
        let post: WithId<Post> | null;
        try{
            post = await postsRepository.findPostByIdOrFail(postId);
        } catch (error) {
            // Если выброшено RepositoryNotFoundError - пост не найден
            if (error instanceof RepositoryNotFoundError) {
                return ResultObject.NotFound('postId', 'Post with this Id is not exist');
            }
            // Другие ошибки
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
        const createdCommentId: string = await commentsRepository.createComment(newComment);
        const createdComment: WithId<CommentDB> = await commentsRepository.findCommentById(createdCommentId);
        const createdCommentOutput: CommentOutput = await commentsRepository.mapToCommentOutput(createdComment);
        return ResultObject.Created(createdCommentOutput);
    },
    async updateComment(commentId: string, userId: string, dto: CommentInputDto): Promise<Result> {
        const checkResult = await this.checkUserId(userId, commentId);
        if(checkResult.status === ResultStatus.Forbidden||checkResult.status === ResultStatus.NotFound) {
            return checkResult;
        }
        const result: UpdateResult = await commentsRepository.updateComment(commentId, dto);
        if(result.matchedCount <1) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        return ResultObject.NoContent();
    },
    async deleteComment(userId: string, commentId: string): Promise<Result> {
       const checkResult = await this.checkUserId(userId, commentId);
       if(checkResult.status === ResultStatus.Forbidden||checkResult.status === ResultStatus.NotFound) {
           return checkResult;
       }
        const result: DeleteResult = await commentsRepository.deleteComment(commentId);
        if(result.deletedCount<1) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        return ResultObject.NoContent();
    },
    async checkUserId(userId: string, commentId: string): Promise<Result> {
        const comment = await commentsRepository.findCommentById(commentId);
        if (!comment) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        if (comment.userId !== userId) {
            return ResultObject.Forbidden();
        }
        return ResultObject.Success(null);
    }
}