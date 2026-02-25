import {ObjectId, WithId} from "mongodb";
import {User} from "../domain/user";
import {userCollection} from "../../db/mongo.bd";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {UserOutput} from "../routes/output/user-output";
import {UserQueryInput} from "../routes/input/user-query.input";
import {UserListPaginatedOutput} from "../routes/output/user-list-paginted.output";
import {UserDB} from "../routes/output/user.db";
import {normalizeEmail} from "../../core/helpers/normolize-email";
import { injectable } from 'inversify';

@injectable()
export class UsersQueryRepository {
    async findUserByIdOrFail(id: string): Promise<WithId<User>> {
        const user = await userCollection.findOne({_id: new ObjectId(id)});
        if (!user) {
            throw new RepositoryNotFoundError("User not found.");
        }
        return user;
    }
    async isEmailUnique(email: string): Promise<Boolean> {
        const normalizedEmail = normalizeEmail(email);
        const user = await userCollection.findOne({email: normalizedEmail});
        return !user;
    }
    async isLoginUnique(login: string): Promise<Boolean> {
        const loginUser = login.trim();
        const user = await userCollection.findOne({login: loginUser});
        return !user;
    }
    async findManyUsers(queryDto: UserQueryInput): Promise<{items: WithId<User>[], totalCount: number}> {
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
        const items: WithId<User>[] = await userCollection
            .find(filter)
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(pageSize)
            .toArray();
        const totalCount = await userCollection.countDocuments(filter);
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
    async findByConfirmationCode(code: string): Promise<WithId<UserDB>| null> {
        const user: WithId<UserDB>|null = await userCollection.findOne({"emailConfirmation.confirmationCode": code});
        return user;
    }
    async findUserByEmail(email: string): Promise<WithId<UserDB>| null> {
        const normalizedEmail = normalizeEmail(email);
        const user: WithId<UserDB>|null = await userCollection.findOne({"email":normalizedEmail})
        return user;
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDB>|null> {
        const normalizedEmail = normalizeEmail(loginOrEmail);
        return await userCollection.findOne({
            $or: [{login: loginOrEmail }, { email: normalizedEmail }],
        });
    }
}

