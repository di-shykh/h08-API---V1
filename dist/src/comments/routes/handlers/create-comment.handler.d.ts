import { CommentInputDto } from "../../application/dtos/comment.input-dto";
import { Request, Response } from 'express';
export declare function createCommentHandler(req: Request<{
    id: string;
}, {}, CommentInputDto>, res: Response): Promise<void>;
//# sourceMappingURL=create-comment.handler.d.ts.map