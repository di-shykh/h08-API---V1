import { Request, Response } from "express";
import { PostCreateInput } from "../../../posts/routes/input/post-create.input";
export declare function createBlogPostHandler(req: Request<{
    id: string;
}, PostCreateInput>, res: Response): Promise<void>;
//# sourceMappingURL=create-blog-post.handler.d.ts.map