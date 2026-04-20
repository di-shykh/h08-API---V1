import {CommentInputDto} from "./dtos/comment.input-dto";
import {ResultStatus} from "../../core/result/result.code";
import {Result, ResultObject} from "../../core/result/result.type";
import {CommentDB} from "../routes/output/commnent.db";
import {DeleteResult} from "mongodb";
import {CommentOutput} from "../routes/output/comment-output";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentsRepository} from "../repositories/comments.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import {inject, injectable} from 'inversify';
import {PostDocument} from "../../posts/domain/post.entity";
import {CommentDocument} from "../domain/comment.entity";
import {LikeStatus} from "../../likes/types/likeStatus";
import {LikesRepository} from "../../likes/repositories/likes.repository";
import {LikeModel} from "../../likes/domain/like.entity";

@injectable()
export class CommentsService {
    commentsRepository: CommentsRepository;
    postsRepository: PostsRepository;
    likesRepository: LikesRepository;

    constructor(
        @inject(CommentsRepository) commentsRepository: CommentsRepository,
        @inject(PostsRepository) postsRepository: PostsRepository,
        @inject(LikesRepository) likesRepository: LikesRepository,
    ) {
        this.commentsRepository = commentsRepository;
        this.postsRepository = postsRepository;
        this.likesRepository = likesRepository;
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
            likesCount: 0,
            dislikesCount: 0,
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
    async changeLikeStatus (commentId: string, userId: string, likeStatus: LikeStatus): Promise<Result> {
        const comment = await this.commentsRepository.findCommentById(commentId);
        if (!comment) {
            return ResultObject.NotFound('commentId', 'Comment with this Id is not exist');
        }
        if(!Object.values(LikeStatus).includes(likeStatus)) {
            return ResultObject.BadRequest('likeStatus', 'LikeStatus isn\'t valid!');
        }
        const like = await this.likesRepository.findLikeByUserIdAndParentId(userId, commentId);
        if (!like && likeStatus !== LikeStatus.none) {
            const newLike = new LikeModel({
                createdAt: new Date(),
                status: likeStatus,
                authorId: userId,
                parentId: commentId,
            });
            await this.likesRepository.save(newLike);

            if(likeStatus === LikeStatus.like) {
                comment.likesCount++;
            }
            if(likeStatus===LikeStatus.dislike) {
                comment.dislikesCount++;
            }
            await this.commentsRepository.save(comment);
            return ResultObject.NoContent();
        }
        if(like) {
            if(likeStatus === like.status){
                return ResultObject.NoContent();
            }
            if(likeStatus === LikeStatus.like) {
                like.status = likeStatus;
                await this.likesRepository.save(like);
                comment.likesCount++;
                comment.dislikesCount--;
                await this.commentsRepository.save(comment);
            }
            else if(likeStatus === LikeStatus.dislike) {
                like.status = likeStatus;
                await this.likesRepository.save(like);
                comment.likesCount--;
                comment.dislikesCount++;
                await this.commentsRepository.save(comment);
            }
            else if(likeStatus === LikeStatus.none) {
                if(like.status === LikeStatus.like) {
                    comment.likesCount--;
                }
                else if (like.status === LikeStatus.dislike) {
                   comment.dislikesCount--;
                }
                await this.likesRepository.deleteLike(like._id.toString());
                await this.commentsRepository.save(comment);
            }
        }
        return ResultObject.NoContent();
    }
}
