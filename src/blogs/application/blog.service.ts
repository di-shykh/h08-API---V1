import {BlogsRepository} from "../repositories/blogs.repository";
import {Blog} from "../types/blog";
import {BlogAttributes} from "./dtos/blog-attributes";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import { inject, injectable } from 'inversify';
import {PostDocument} from "../../posts/domain/post.entity";

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
        const blog = await this.blogsRepository.findBlogByIdOrFail(id);
        if (blog) {
            blog.name = dto.name;
            blog.description = dto.description;
            blog.websiteUrl = dto.websiteUrl;
            await this.blogsRepository.save(blog);
        }
       return;
    }
    async delete(id: string): Promise<void> {
        const postsWithBlogId = await this.postsRepository.findPostsByBlogId(id);
        if(postsWithBlogId && postsWithBlogId.totalCount > 0){
            await Promise.all(postsWithBlogId.items.map( (post: PostDocument) => {
                this.postsRepository.deletePost(post._id.toString())
            }))
        }
        await this.blogsRepository.deleteBlog(id);
        return;
    }
}
