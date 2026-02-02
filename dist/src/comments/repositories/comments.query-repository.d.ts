import { WithId } from "mongodb";
import { CommentDB } from "../routes/output/commnent.db";
import { CommentOutput } from "../routes/output/comment-output";
import { CommentQueryInput } from "../routes/input/comment-query.input";
import { CommentListPaginatedOutput } from "../routes/output/comment-list-paginated.output";
export declare const commentsQueryRepository: {
    findCommentById(id: string): Promise<WithId<CommentDB>>;
    findManyComments(queryDto: CommentQueryInput, postId: string): Promise<{
        items: WithId<CommentDB>[];
        totalCount: number;
    }>;
    mapToCommentOutput(comment: WithId<CommentDB>): Promise<CommentOutput>;
    mapToCommentListOutput(comments: WithId<CommentDB>[], pageNumber: number, pageSize: number, totalCount: number): Promise<CommentListPaginatedOutput>;
};
//# sourceMappingURL=comments.query-repository.d.ts.map