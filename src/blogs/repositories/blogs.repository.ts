import {Blog} from "../types/blog";
import {BlogInputDto} from "../application/dtos/blog.input-dto";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import { injectable } from 'inversify';
import {BlogDocument, BlogModel} from "../domain/blog.entity";

@injectable()
export class BlogsRepository {
    async save(blog: BlogDocument): Promise<void> {
        await blog.save();
    }
    async createBlog(newBlog: Blog): Promise<string> {
        const insertResult = await BlogModel.create(newBlog);
        return insertResult._id.toString();
    }
    async deleteBlog(id: string): Promise<void> {
        const deleteResult = await BlogModel.deleteOne({_id: id});
        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
       return;
    }
    async findBlogByIdOrFail(id: string): Promise<BlogDocument> {
        const res = await BlogModel.findOne({_id: id});
        if(!res) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
        return res;
    }
}
