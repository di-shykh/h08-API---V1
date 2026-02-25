import {Post} from "../domain/post";
import {PostInputDto} from "../application/dtos/post.input-dto";
import {postCollection} from "../../db/mongo.bd";
import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {PostQueryInput} from "../routes/input/post-query.input";
import { injectable } from 'inversify';

@injectable()
export class PostsRepository {
    async createPost(newPost: Post): Promise<string> {
        const insertPost = await postCollection.insertOne(newPost);
        return insertPost.insertedId.toString();
    }
   async updatePost(id: string, dto: PostInputDto): Promise<void> {
        const updatePostResult = await postCollection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {
                    title: dto.title,
                    shortDescription: dto.shortDescription,
                    content: dto.content,
                    blogId: dto.blogId,
                }
            });
        if (updatePostResult.matchedCount < 1) {
            throw new RepositoryNotFoundError("Post not found.");
        }

        return;
    }
    async deletePost(id: string): Promise<void> {
        const deletePostResult = await postCollection.deleteOne({_id: new ObjectId(id)});
        if (deletePostResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("Post not found.");
        }
        return;
    }
    async findPostsByBlogId(blogId: string, queryDto?: PostQueryInput ): Promise<{items: WithId<Post>[], totalCount: number}> {
        const filter: any = {'blogId': blogId};
        let items: WithId<Post>[];
        if(queryDto) {
            const {
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            } = queryDto;
            const skip = (pageNumber - 1) * pageSize;
            items = await postCollection
                .find(filter)
                .sort({[sortBy]: sortDirection})
                .skip(skip)
                .limit(pageSize)
                .toArray();
        }
        else {
            items = await postCollection.find(filter).toArray();
        }
        const totalCount = await postCollection.countDocuments(filter);
        return {items, totalCount};
    }
    async findPostByIdOrFail(id: string): Promise<WithId<Post>> {
        const result = await postCollection.findOne({_id: new ObjectId(id)});
        if (!result) {
            throw new RepositoryNotFoundError("Post not found.");
        }
        return result;
    }
}


