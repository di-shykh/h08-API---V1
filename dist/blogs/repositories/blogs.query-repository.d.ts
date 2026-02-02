import { BlogQueryInput } from "../routes/input/blog-query.input";
import { WithId } from "mongodb";
import { Blog } from "../types/blog";
import { BlogListPaginatedOutput } from "../routes/output/blog-list-paginated.output";
import { BlogOutput } from "../routes/output/blog.output";
export declare const blogsQueryRepository: {
    findAllBlogs(): Promise<WithId<Blog>[]>;
    findBlogById(id: string): Promise<WithId<Blog> | null>;
    findManyBlogs(queryDto: BlogQueryInput): Promise<{
        items: WithId<Blog>[];
        totalCount: number;
    }>;
    findBlogByIdOrFail(id: string): Promise<WithId<Blog>>;
    mapToBlogListPaginatedOutput(blogs: WithId<Blog>[], pageNumber: number, pageSize: number, totalCount: number): BlogListPaginatedOutput;
    mapToBlogOutput(blog: WithId<Blog>): BlogOutput;
};
//# sourceMappingURL=blogs.query-repository.d.ts.map