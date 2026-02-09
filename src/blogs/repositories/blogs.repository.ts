import {Blog} from "../types/blog";
import {BlogInputDto} from "../application/dtos/blog.input-dto";
import {blogCollection} from "../../db/mongo.bd";
import {ObjectId, WithId} from "mongodb";
import {BlogQueryInput} from "../routes/input/blog-query.input";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";

export const blogsRepository = {

    async createBlog(newBlog: Blog): Promise<string> {
        const insertResult = await blogCollection.insertOne(newBlog);
        return insertResult.insertedId.toString();
    },

    async updateBlog(id: string, dto: BlogInputDto): Promise<void> {
        const updateResult = await blogCollection.updateOne(
            {
                _id: new ObjectId(id),
            },
            {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            },
        );
        if (updateResult.matchedCount < 1) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
        return;
    },
    async deleteBlog(id: string): Promise<void> {
        const deleteResult = await blogCollection.deleteOne({_id: new ObjectId(id)});
        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
       return;
    },
    async findBlogByIdOrFail(id: string): Promise<WithId<Blog>> {
        const res = await blogCollection.findOne({_id: new ObjectId(id)});
        if(!res) {
            throw new RepositoryNotFoundError("Blog not found.");
        }
        return res;
    },

}