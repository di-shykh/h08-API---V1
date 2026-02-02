import { WithId } from "mongodb";
import { User } from "../domain/user";
import { UserOutput } from "../routes/output/user-output";
import { UserQueryInput } from "../routes/input/user-query.input";
import { UserListPaginatedOutput } from "../routes/output/user-list-paginted.output";
import { UserDB } from "../routes/output/user.db";
export declare const usersQueryRepository: {
    findUserByIdOrFail(id: string): Promise<WithId<User>>;
    isEmailUnique(email: string): Promise<Boolean>;
    isLoginUnique(login: string): Promise<Boolean>;
    findManyUsers(queryDto: UserQueryInput): Promise<{
        items: WithId<User>[];
        totalCount: number;
    }>;
    mapToUserOutput(user: WithId<User>): UserOutput;
    mapToUserListPaginatedOutput(users: WithId<User>[], pageNumber: number, pageSize: number, totalCount: number): UserListPaginatedOutput;
    findByConfirmationCode(code: string): Promise<WithId<UserDB> | null>;
    findUserByEmail(email: string): Promise<WithId<UserDB> | null>;
    findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDB> | null>;
};
//# sourceMappingURL=user.query-repository.d.ts.map