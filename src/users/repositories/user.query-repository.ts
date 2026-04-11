import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {UserOutput} from "../routes/output/user-output";
import {UserQueryInput} from "../routes/input/user-query.input";
import {UserListPaginatedOutput} from "../routes/output/user-list-paginted.output";
import { injectable } from 'inversify';
import {UserModel, UserDocument} from "../domain/user.entity";

@injectable()
export class UsersQueryRepository {
    async findUserByIdOrFail(id: string): Promise<UserDocument> {
        const user = await UserModel.findOne({_id: id});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        return user;
    }
    async findManyUsers(queryDto: UserQueryInput): Promise<{items: UserDocument[], totalCount: number}> {
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
        const items: UserDocument[] = await UserModel
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize);
        const totalCount = await UserModel.countDocuments(filter);
        return {items, totalCount};
    }
    mapToUserOutput(user: UserDocument): UserOutput {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        }
    }
    mapToUserListPaginatedOutput(
        users: UserDocument[],
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

