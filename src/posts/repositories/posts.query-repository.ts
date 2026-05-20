import {PostQueryInput} from "../routes/input/post-query.input";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {PostListPaginatedOutput} from "../routes/output/post-list-paginated.output";
import {PostOutput} from "../routes/output/post-output";
import {injectable} from 'inversify';
import {PostDocument, PostModel} from "../domain/post.entity";
import {ExtendedLikeDocument, ExtendedLikeModel} from "../../likes/domain/extendedLike.entity";
import {LikeStatus} from "../../likes/types/likeStatus";

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
    async mapToPostListPaginatedOutput(
        posts:PostDocument[],
        pageNumber: number, pageSize: number, totalCount: number,
        userId?: string
    ): Promise<PostListPaginatedOutput> {
        let extendedLikesMap = new Map<string, ExtendedLikeDocument>();
        if(userId){
            const postIds = posts.map(p => p._id.toString());
            if(postIds.length > 0){
                const extendedLikes = await ExtendedLikeModel.find({
                    userId: userId,
                    postId: { $in: postIds },
                });
                if (extendedLikes && extendedLikes.length>0) {
                    extendedLikesMap = new Map(
                        extendedLikes.map(like => [like.postId, like])
                    )
                }
            }
        }
        const items: PostOutput[] = posts.map((post): PostOutput => {
            let like = extendedLikesMap.get(post._id.toString());
            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.extendedLikesInfo.likesCount,
                    dislikesCount: post.extendedLikesInfo.dislikesCount,
                    myStatus: like?.status ?? LikeStatus.none,
                    newestLikes: (post.extendedLikesInfo.newestLikes || []).map(item=> ({
                            addedAt: item.addedAt,
                            userId: item.userId,
                            login: item.login
                        }
                    ))
                }
            }
        })
        return {
            pagesCount: Math.ceil(totalCount/pageSize),
            page:pageNumber,
            pageSize: pageSize,
            totalCount:totalCount,
            items: items,
        }
    }
    async mapToPostOutput(post: PostDocument, userId?: string): Promise<PostOutput> {
        let extendedLike= null;
        let myStatus: LikeStatus = LikeStatus.none;
        if(userId){
            extendedLike = await ExtendedLikeModel.findOne({
                userId: userId,
                postId: post._id.toString(),
            });
            myStatus = extendedLike?.status ?? LikeStatus.none;
        }
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfo.likesCount ?? 0,
                dislikesCount: post.extendedLikesInfo.dislikesCount ?? 0,
                myStatus: myStatus,
                newestLikes: (post.extendedLikesInfo?.newestLikes || []).map(item=> ({
                        addedAt: item.addedAt,
                        userId: item.userId,
                        login: item.login
                    }
                ))
            }
        };
    }
}
