import {blogsRepository} from "../repositories/blogs.repository";
import {WithId} from "mongodb";
import {Blog} from "../types/blog";
import {postsRepository} from "../../posts/repositories/posts.repository";
import {BlogAttributes} from "./dtos/blog-attributes";
import {Post} from "../../posts/domain/post";
import {postsQueryRepository} from "../../posts/repositories/posts.query-repository";

export const blogsService = {
    async create(dto: BlogAttributes): Promise<string> {
        const newBlog: Blog = {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };
        return await blogsRepository.createBlog(newBlog);
    },
    async update(id: string, dto: BlogAttributes): Promise<void> {
        const updateResult = await blogsRepository.updateBlog(id, dto);
       return;
    },
    async delete(id: string): Promise<void> {
        const postsWithBlogId = await postsRepository.findPostsByBlogId(id);
        if(postsWithBlogId && postsWithBlogId.totalCount > 0){
            await Promise.all(postsWithBlogId.items.map( (post: WithId<Post>) => {
                postsRepository.deletePost(post._id.toString())
            }))
        }
        await blogsRepository.deleteBlog(id);
        return;
    }
}