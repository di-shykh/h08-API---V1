import {PostsRepository} from "../repositories/posts.repository";
import {PostAttributes} from "./dtos/post-attributs";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {BlogsRepository} from "../../blogs/repositories/blogs.repository";

export class PostsService {
    postsRepository: PostsRepository;
    blogsRepository: BlogsRepository;

    constructor(postsRepository: PostsRepository, blogsRepository: BlogsRepository) {
        this.postsRepository = postsRepository;
        this.blogsRepository = blogsRepository;
    }

    async createPost(dto: PostAttributes): Promise<string> {
        const blog = await this.blogsRepository.findBlogByIdOrFail(dto.blogId);
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
        return await this.postsRepository.createPost(newPost);
    }
    async updatePost(id: string, dto: PostAttributes): Promise<void> {
        await this.postsRepository.updatePost(id, dto);
    }
    async deletePost(id: string): Promise<void> {
        await this.postsRepository.deletePost(id);
    }
}
