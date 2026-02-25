import {BlogsRepository} from "../repositories/blogs.repository";
import {WithId} from "mongodb";
import {Blog} from "../types/blog";
import {BlogAttributes} from "./dtos/blog-attributes";
import {Post} from "../../posts/domain/post";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import { inject, injectable } from 'inversify';

@injectable()
export class BlogsService {
    blogsRepository: BlogsRepository;
    postsRepository: PostsRepository;

    constructor(
        @inject(BlogsRepository) blogsRepository: BlogsRepository,
        @inject(PostsRepository) postsRepository: PostsRepository
    ) {
        this.blogsRepository = blogsRepository;
        this.postsRepository = postsRepository;
    }

    async create(dto: BlogAttributes): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };
        return await this.blogsRepository.createBlog(newBlog);
    }
    async update(id: string, dto: BlogAttributes): Promise<void> {
        const updateResult = await this.blogsRepository.updateBlog(id, dto);
       return;
    }
    async delete(id: string): Promise<void> {
        const postsWithBlogId = await this.postsRepository.findPostsByBlogId(id);
        if(postsWithBlogId && postsWithBlogId.totalCount > 0){
            await Promise.all(postsWithBlogId.items.map( (post: WithId<Post>) => {
                this.postsRepository.deletePost(post._id.toString())
            }))
        }
        await this.blogsRepository.deleteBlog(id);
        return;
    }
}
