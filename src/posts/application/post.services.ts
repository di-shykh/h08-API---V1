import {postsRepository} from "../repositories/posts.repository";
import {PostAttributes} from "./dtos/post-attributs";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {blogsQueryRepository} from "../../blogs/repositories/blogs.query-repository";
import {blogsRepository} from "../../blogs/repositories/blogs.repository";

export const postsService = {
    async createPost(dto: PostAttributes): Promise<string> {
        const blog = await blogsRepository.findBlogByIdOrFail(dto.blogId);
        if(!blog){
            throw new RepositoryNotFoundError("Blog does not exist");
        }
        const newPost = {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: dto.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString(),
        }
        return await postsRepository.createPost(newPost);
    },
    async updatePost(id: string, dto: PostAttributes): Promise<void> {
        await postsRepository.updatePost(id, dto);
    },
    async deletePost(id: string): Promise<void> {
        await postsRepository.deletePost(id);
    }
}