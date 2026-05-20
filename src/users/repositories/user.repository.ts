import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {normalizeEmail} from "../../core/helpers/normolize-email";
import { injectable } from 'inversify';
import {UserDocument, UserModel} from "../domain/user.entity";

@injectable()
export class UsersRepository {
    async save(user: UserDocument): Promise<void>  {
        await user.save();
    }
    async saveAndReturnId(user: UserDocument): Promise<string>  {
        await user.save();
        return user._id.toString();
    }
    async deleteUser(id: string): Promise<void> {
        const deletedUser = await UserModel.deleteOne({_id: id});
        if(deletedUser.deletedCount<1) {
            throw new RepositoryNotFoundError("User not found");
        }
        return;
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument|null> {
        const normalizedEmail = normalizeEmail(loginOrEmail);
        return UserModel.findOne({
            $or: [{login: loginOrEmail }, { email: normalizedEmail }],
        });
    }
    async isEmailUnique(email: string): Promise<boolean> {
        const normalizedEmail = normalizeEmail(email);
        const user = await UserModel.findOne({email: normalizedEmail}).lean();
        return !user;
    }
    async isLoginUnique(login: string): Promise<boolean> {
        const loginUser = login.trim();
        const user = await UserModel.findOne({login: loginUser}).lean();
        return !user;
    }
    async findByConfirmationCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({"emailConfirmation.confirmationCode": code});
    }
    async findUserByEmail(email: string): Promise<UserDocument | null> {
        const normalizedEmail = normalizeEmail(email);
        return UserModel.findOne({"email":normalizedEmail});
    }
    async saveNewPassword(userId: string, newPasswordHash: string): Promise<boolean> {
        const result = await UserModel.updateOne(
            {_id: userId},
            {
                $set: {
                    "passwordHash": newPasswordHash,
                }
            }
        );
        return result.modifiedCount === 1;
    }
    async findUsersLoginByIds(ids: string[]): Promise<Map<string, string>| null> {
        const users = await UserModel.find({_id: {$in: ids}}).lean();
        const loginMap = new Map<string, string>();
        users.forEach(user => {
            loginMap.set(user._id.toString(), user.login);
        })
        return loginMap;
    }
}
