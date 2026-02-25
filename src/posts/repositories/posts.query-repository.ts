import {ObjectId, WithId} from "mongodb";
import {Post} from "../domain/post";
import {postCollection} from "../../db/mongo.bd";
import {PostQueryInput} from "../routes/input/post-query.input";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {PostListPaginatedOutput} from "../routes/output/post-list-paginated.output";
import {PostOutput} from "../routes/output/post-output";
import { injectable } from 'inversify';

@injectable()
export class PostsQueryRepository {
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
    async findManyPosts(queryDto: PostQueryInput): Promise<{items: WithId<Post>[], totalCount: number}> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchPostTitleTerm,
        } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};
        if(searchPostTitleTerm){
            filter.title = { $regex: searchPostTitleTerm, $options: "i" };
        }
        const items: WithId<Post>[] = await postCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();
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
    mapToPostListPaginatedOutput(
        posts:WithId<Post>[],
        pageNumber: number, pageSize: number, totalCount: number,
    ): PostListPaginatedOutput {
        return {
            pagesCount: Math.ceil(totalCount/pageSize),
            page:pageNumber,
            pageSize: pageSize,
            totalCount:totalCount,
            items: posts.map((post): PostOutput => ({
                    id: post._id.toString(),
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt,
                }),
            ),
        }
    }
    mapToPostOutput(post: WithId<Post>): PostOutput {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
        };
    }
}
