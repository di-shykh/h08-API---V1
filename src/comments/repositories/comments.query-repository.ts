import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentOutput} from "../routes/output/comment-output";
import {UserDB} from "../../users/routes/output/user.db";
import {CommentQueryInput} from "../routes/input/comment-query.input";
import {CommentListPaginatedOutput} from "../routes/output/comment-list-paginated.output";
import {injectable} from 'inversify';
import {CommentDocument, CommentModel} from "../domain/comment.entity";
import {UserDocument, UserModel} from "../../users/domain/user.entity";
import {LikeDocument, LikeModel} from "../../likes/domain/like.entity";
import {LikeStatus} from "../../likes/types/likeStatus";

@injectable()
export class CommentsQueryRepository {
    async findCommentById(id: string): Promise<CommentDocument> {
        const result = await CommentModel.findOne({_id: id});
        if (!result) {
            throw new RepositoryNotFoundError("Comment not found.");
        }
        return result;
    }
    async findManyComments(queryDto: CommentQueryInput, postId: string): Promise<{items: CommentDocument[], totalCount: number}> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            // postId,
            userId,
            userLogin,
            createdAt,
            searchContentTerm,
        } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        const filter: any = {};
        if (searchContentTerm) {
            filter.content = { $regex: searchContentTerm, $options: "i" };
        }
        if(postId) {
            filter.postId = postId;
        }
        if(userId) {
            filter.userId = userId;
        }
        if(createdAt) {
            filter.createdAt = createdAt;
        }
        if(userLogin) {
            filter.userLogin = userLogin;
        }
        const items: CommentDocument[] = await CommentModel
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize);
        const totalCount = await CommentModel.countDocuments(filter);
        return {items, totalCount};
    }
    async mapToCommentOutput(comment: CommentDocument, userId?: string): Promise<CommentOutput> {
        const user: UserDocument | null = await UserModel.findOne({_id: comment.userId});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        let like = null;
        if (userId) {
            like = await LikeModel.findOne({
                authorId: userId,
                parentId: comment._id.toString(),
            });
        }
        const commentOutput: CommentOutput = {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: user.login
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: comment.likesCount,
                dislikesCount: comment.dislikesCount,
                myStatus: like?.status ?? LikeStatus.none,
            }
        }
        return commentOutput;
    }
    async mapToCommentListOutput(
        comments: CommentDocument[],
        pageNumber: number,
        pageSize: number,
        totalCount: number,
        userId?: string
    ): Promise<CommentListPaginatedOutput> {
        if (comments.length === 0) {
            return {
                pagesCount: 0,
                page: pageNumber,
                pageSize: pageSize,
                totalCount: 0,
                items: []
            };
        }

        const userIds = comments.map(comment => comment.userId);
        const users = await UserModel.find({
            _id: { $in: userIds.map(id => id) }
        }).lean();
        const userMap = new Map<string, UserDB>();
        users.forEach(user => {
            userMap.set(user._id.toString(), user);
        });
        let likeMap = new Map<string, LikeDocument>();
        if (userId) {
            const commentsIds = comments.map(comment => comment._id.toString());
            const  likes = await LikeModel.find({
                authorId: userId,
                parentId: {$in: commentsIds},
            });
            if(likes && likes.length>0){
                likeMap = new Map(
                    likes.map(like => [like.parentId.toString(), like])
                );
            }
        }
        const items: CommentOutput[] = await Promise.all(
            comments.map(async (comment: CommentDocument): Promise<CommentOutput> => {
                const user: UserDB | undefined = userMap.get(comment.userId);
                if (!user) {
                    throw new RepositoryNotFoundError(`User with id ${comment.userId} not found.`);
                }
                let like = likeMap.get(comment._id.toString());

                return {
                    id: comment._id.toString(),
                    content: comment.content,
                    commentatorInfo: {
                        userId: comment.userId,
                        userLogin: user.login
                    },
                    createdAt: comment.createdAt,
                    likesInfo: {
                        likesCount: comment.likesCount,
                        dislikesCount: comment.dislikesCount,
                        myStatus: like?.status ?? LikeStatus.none,
                    }
                };
            })
        )
        return {
            pagesCount: Math.ceil(totalCount/pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: items
        }
    }
}


