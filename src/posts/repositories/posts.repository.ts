import {Post} from "../domain/post";
import {PostInputDto} from "../application/dtos/post.input-dto";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {PostQueryInput} from "../routes/input/post-query.input";
import { injectable } from 'inversify';
import {PostDocument, PostModel} from "../domain/post.entity";

@injectable()
export class PostsRepository {
    async save(post: PostDocument): Promise<void>{
        await post.save();
    }
    async createPost(newPost: Post): Promise<string> {
        const insertPost = await PostModel.create(newPost);
        return insertPost._id.toString();
    }
    async deletePost(id: string): Promise<void> {
        const deletePostResult = await PostModel.deleteOne({_id: id});
        if (deletePostResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Post not found.");
        }
        return;
    }
    async findPostsByBlogId(blogId: string, queryDto?: PostQueryInput ): Promise<{items: PostDocument[], totalCount: number}> {
        const filter: any = {'blogId': blogId};
        let items: PostDocument[] = [];
        if(queryDto) {
            const {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            items = await PostModel
                .find(filter)
                .sort({[sortBy]: sortDirection})
                .skip(skip)
                .limit(pageSize);
        }
        else {
            items = await PostModel.find(filter);
        }
        const totalCount = await PostModel.countDocuments(filter);
        return {items, totalCount};
    }
    async findPostByIdOrFail(id: string): Promise<PostDocument> {
        const result = await PostModel.findOne({_id: id});
        if (!result) {
            throw new RepositoryNotFoundError("Post not found.");
        }
        return result;
    }
}


