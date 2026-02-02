import { Blog } from "../types/blog";
import { BlogInputDto } from "../application/dtos/blog.input-dto";
export declare const blogsRepository: {
    createBlog(newBlog: Blog): Promise<string>;
    updateBlog(id: string, dto: BlogInputDto): Promise<void>;
    deleteBlog(id: string): Promise<void>;
};
//# sourceMappingURL=blogs.repository.d.ts.map