import {User} from "../domain/user";
import {UserDB} from "../routes/output/user.db";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {UserOutput} from "../routes/output/user-output";
import {UserQueryInput} from "../routes/input/user-query.input";
import {UserListPaginatedOutput} from "../routes/output/user-list-paginted.output";
import { injectable } from 'inversify';
import {UserModel, UserDocument} from "../domain/user.entity";
import mongoose from "mongoose";

@injectable()
export class UsersQueryRepository {
    async findUserByIdOrFail(id: string): Promise<UserDocument> {
        const user = await UserModel.findOne({_id: new mongoose.Types.ObjectId(id)});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        return user;
    }
    async findManyUsers(queryDto: UserQueryInput): Promise<{items: <UserDB>[], totalCount: number}> {
        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchLoginTerm,
            searchEmailTerm,
        } = queryDto;
        const skip = (pageNumber - 1) * pageSize;
        let filter: any = {};
        if(searchLoginTerm && searchEmailTerm) {
            filter = {
                $or: [
                    { login: { $regex: searchLoginTerm, $options: "i" }},
                    {email: { $regex: searchEmailTerm, $options: "i" }},
                ]
            }
        }
        else if (searchLoginTerm) {
            filter.login = { $regex: searchLoginTerm, $options: "i" };
        }
        else if(searchEmailTerm) {
            filter.email = { $regex: searchEmailTerm, $options: "i" };
        }
        const items: <UserDB>[] = await UserModel
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .lean();
        const totalCount = await UserModel.countDocuments(filter);
        return {items, totalCount};
    }
    mapToUserOutput(user: WithId<User>): UserOutput {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        }
    }
    mapToUserListPaginatedOutput(
        users: WithId<User>[],
        pageNumber: number,
        pageSize: number,
        totalCount: number,
    ): UserListPaginatedOutput {
        return {
            pagesCount: Math.ceil(totalCount/pageSize),
            page:pageNumber,
            pageSize: pageSize,
            totalCount:totalCount,
            items: users.map((user): UserOutput => ({
                    id: user._id.toString(),
                    login: user.login,
                    email: user.email,
                    createdAt: user.createdAt,
                }),
            ),
        }
    }
}

