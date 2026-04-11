import {PostQueryInput} from "../routes/input/post-query.input";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {PostListPaginatedOutput} from "../routes/output/post-list-paginated.output";
import {PostOutput} from "../routes/output/post-output";
import { injectable } from 'inversify';
import { PostModel, PostDocument} from "../domain/post.entity";

@injectable()
export class PostsQueryRepository {
    async findPostsByBlogId(blogId: string, queryDto?: PostQueryInput ): Promise<{items: PostDocument[], totalCount: number}> {
        const filter: any = {'blogId': blogId};
        let items: PostDocument[];
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
    async findManyPosts(queryDto: PostQueryInput): Promise<{items: PostDocument[], totalCount: number}> {
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
        const items: PostDocument[] = await PostModel
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize);
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
    mapToPostListPaginatedOutput(
        posts:PostDocument[],
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
    mapToPostOutput(post: PostDocument): PostOutput {
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
