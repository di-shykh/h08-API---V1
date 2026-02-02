import { CommentInputDto } from "./dtos/comment.input-dto";
import { Result } from "../../core/result/result.type";
import { CommentOutput } from "../routes/output/comment-output";
export declare const commentsService: {
    createComment(postId: string, userId: string, dto: CommentInputDto): Promise<Result<CommentOutput | null>>;
    updateComment(commentId: string, userId: string, dto: CommentInputDto): Promise<Result>;
    deleteComment(userId: string, commentId: string): Promise<Result>;
    checkUserId(userId: string, commentId: string): Promise<Result>;
};
//# sourceMappingURL=comment.services.d.ts.map