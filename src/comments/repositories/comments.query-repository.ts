import {ObjectId, WithId} from "mongodb";
import {CommentDB} from "../routes/output/commnent.db";
import {commentCollection, userCollection} from "../../db/mongo.bd";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {CommentOutput} from "../routes/output/comment-output";
import {UserDB} from "../../users/routes/output/user.db";
import {CommentQueryInput} from "../routes/input/comment-query.input";
import {CommentListPaginatedOutput} from "../routes/output/comment-list-paginated.output";
import { injectable } from 'inversify';

@injectable()
export class CommentsQueryRepository {
    async findCommentById(id: string): Promise<WithId<CommentDB>> {
        const result = await commentCollection.findOne({_id: new ObjectId(id)});
        if (!result) {
            throw new RepositoryNotFoundError("Comment not found.");
        }
        return result;
    }
    async findManyComments(queryDto: CommentQueryInput, postId: string): Promise<{items: WithId<CommentDB>[], totalCount: number}> {
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
        const items: WithId<CommentDB>[] = await commentCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray()
        ;
        const totalCount = await commentCollection.countDocuments(filter);
        return {items, totalCount};
    }
    async mapToCommentOutput(comment: WithId<CommentDB>): Promise<CommentOutput> {
        const user: WithId<UserDB> | null = await userCollection.findOne({_id: new ObjectId(comment.userId)});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        const commentOutput: CommentOutput = {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: user.login
            },
            createdAt: comment.createdAt,
        }
        return commentOutput;
    }
    async mapToCommentListOutput(
        comments: WithId<CommentDB>[],
        pageNumber: number,
        pageSize: number,
        totalCount: number
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
        const users = await userCollection.find({
            _id: { $in: userIds.map(id => new ObjectId(id)) }
        }).toArray();
        const userMap = new Map<string, UserDB>();
        users.forEach(user => {
            userMap.set(user._id.toString(), user);
        });
        const items: CommentOutput[] = comments.map((comment: WithId<CommentDB>): CommentOutput => {
            const user: UserDB | undefined = userMap.get(comment.userId);
            if (!user) {
                throw new RepositoryNotFoundError(`User with id ${comment.userId} not found.`);
            }
            return {
                id: comment._id.toString(),
                content: comment.content,
                commentatorInfo: {
                    userId: comment.userId,
                    userLogin: user.login
                },
                createdAt: comment.createdAt,
            };
        })
        return {
            pagesCount: Math.ceil(totalCount/pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: items
        }
    }
}


