import { Post } from "../domain/post";
import { PostInputDto } from "../application/dtos/post.input-dto";
export declare const postsRepository: {
    createPost(newPost: Post): Promise<string>;
    updatePost(id: string, dto: PostInputDto): Promise<void>;
    deletePost(id: string): Promise<void>;
};
//# sourceMappingURL=posts.repository.d.ts.map