import { Request, Response } from "express";
import { BlogUpdateInput } from "../input/blog-update.input";
export declare function updateBlogHandler(req: Request<{
    id: string;
}, {}, BlogUpdateInput>, res: Response): Promise<void>;
//# sourceMappingURL=update-blog.handler.d.ts.map