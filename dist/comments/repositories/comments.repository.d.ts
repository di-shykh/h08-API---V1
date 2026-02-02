import { CommentDB } from "../routes/output/commnent.db";
import { DeleteResult, UpdateResult } from "mongodb";
import { CommentInputDto } from "../application/dtos/comment.input-dto";
export declare const commentsRepository: {
    createComment(comment: CommentDB): Promise<string>;
    deleteComment(id: string): Promise<DeleteResult>;
    updateComment(commentId: string, dto: CommentInputDto): Promise<UpdateResult>;
};
//# sourceMappingURL=comments.repository.d.ts.map