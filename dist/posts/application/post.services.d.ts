import { PostAttributes } from "./dtos/post-attributs";
export declare const postsService: {
    createPost(dto: PostAttributes): Promise<string>;
    updatePost(id: string, dto: PostAttributes): Promise<void>;
    deletePost(id: string): Promise<void>;
};
//# sourceMappingURL=post.services.d.ts.map