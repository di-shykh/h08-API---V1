import {CommentDB} from "../routes/output/commnent.db";
import {commentCollection, userCollection} from "../../db/mongo.bd";
import {DeleteResult, ObjectId, UpdateResult, WithId} from "mongodb";
import {CommentInputDto} from "../application/dtos/comment.input-dto";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentOutput} from "../routes/output/comment-output";
import {UserDB} from "../../users/routes/output/user.db";
import { injectable } from 'inversify';

@injectable()
export class CommentsRepository {
    async createComment(comment: CommentDB): Promise<string> {
        const insertedComment = await commentCollection.insertOne(comment);
        return insertedComment.insertedId.toString();
    }
    async deleteComment(id: string): Promise<DeleteResult> {
        const deletedComments: DeleteResult = await commentCollection.deleteOne({_id: new ObjectId(id)})
        return deletedComments;
    }
    async updateComment(commentId: string, dto: CommentInputDto): Promise<UpdateResult> {
        const updatedComment = await commentCollection.updateOne(
            {_id: new ObjectId(commentId)},
            {
                $set: {
                    content: dto.content,
                }
            }
        );
        return updatedComment;
    }
    async findCommentById(id: string): Promise<WithId<CommentDB>> {
        const result = await commentCollection.findOne({_id: new ObjectId(id)});
        if (!result) {
            throw new RepositoryNotFoundError("Comment not found.");
        }
        return result;
    }
    async mapToCommentOutput(comment: WithId<CommentDB>): Promise<CommentOutput> {
        const user: WithId<UserDB> | null = await userCollection.findOne({_id: new ObjectId(comment.userId)});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        const commentOutput: CommentOutput = {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: user.login
            },
            createdAt: comment.createdAt,
        }
        return commentOutput;
    }
}
