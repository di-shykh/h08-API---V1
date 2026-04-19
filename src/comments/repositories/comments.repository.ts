import {CommentDB} from "../routes/output/commnent.db";
import { DeleteResult } from "mongoose";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentOutput} from "../routes/output/comment-output";
import { injectable } from 'inversify';
import {CommentModel, CommentDocument} from "../domain/comment.entity";
import {UserDocument, UserModel} from "../../users/domain/user.entity";
import {LikeStatus} from "../../likes/types/likeStatus";
import {LikeModel} from "../../likes/domain/like.entity";

@injectable()
export class CommentsRepository {
    async save(comment: CommentDocument): Promise<void> {
        await comment.save();
    }
    async createComment(comment: CommentDB): Promise<string> {
        const insertedComment = await CommentModel.create(comment);
        return insertedComment._id.toString();
    }
    async deleteComment(id: string): Promise<DeleteResult> {
        const deletedComments: DeleteResult = await CommentModel.deleteOne({_id: id})
        return deletedComments;
    }
    async findCommentById(id: string): Promise<CommentDocument> {
        const result = await CommentModel.findOne({_id: id});
        if (!result) {
            throw new RepositoryNotFoundError("Comment not found.");
        }
        return result;
    }
    async mapToCommentOutput(comment: CommentDocument): Promise<CommentOutput> {
        const user: UserDocument | null = await UserModel.findOne({_id: comment.userId});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        const like = await LikeModel.findOne({
            authorId: comment.userId,
            parentId: comment._id.toString(),
        });
        const commentOutput: CommentOutput = {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: user.login
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: comment.likesCount,
                dislikesCount: comment.dislikesCount,
                myStatus: like?.status ?? LikeStatus.none,
            }
        }
        return commentOutput;
    }
}
