import { WithId } from "mongodb";
import { Post } from "../domain/post";
import { PostQueryInput } from "../routes/input/post-query.input";
import { PostListPaginatedOutput } from "../routes/output/post-list-paginated.output";
import { PostOutput } from "../routes/output/post-output";
export declare const postsQueryRepository: {
    findAllPosts(): Promise<WithId<Post>[]>;
    findPostById(id: string): Promise<WithId<Post> | null>;
    findPostsByBlogId(blogId: string, queryDto?: PostQueryInput): Promise<{
        items: WithId<Post>[];
        totalCount: number;
    }>;
    findManyPosts(queryDto: PostQueryInput): Promise<{
        items: WithId<Post>[];
        totalCount: number;
    }>;
    findPostByIdOrFail(id: string): Promise<WithId<Post>>;
    mapToPostListPaginatedOutput(posts: WithId<Post>[], pageNumber: number, pageSize: number, totalCount: number): PostListPaginatedOutput;
    mapToPostOutput(post: WithId<Post>): PostOutput;
};
//# sourceMappingURL=posts.query-repository.d.ts.map