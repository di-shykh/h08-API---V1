import {UserDB} from "../routes/output/user.db";
//import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {normalizeEmail} from "../../core/helpers/normolize-email";
import { injectable } from 'inversify';
import mongoose from 'mongoose';
import {UserDocument, UserModel} from "../domain/user.entity";

@injectable()
export class UsersRepository {
    async save(user: UserDocument): Promise<void>  {
        await user.save();
    }
    async createUser(newUser: UserDB): Promise<string> {
        const insertedUser = await UserModel.create(newUser);
        return insertedUser._id.toString();
    }
    async deleteUser(id: string): Promise<void> {
        const deletedUser = await UserModel.deleteOne({_id: new mongoose.Types.ObjectId(id)});
        if(deletedUser.deletedCount<1) {
            throw new RepositoryNotFoundError("User not found");
        }
        return;
    }
    async confirmEmail(code: string): Promise<boolean | null> {
        try {
            const result = await UserModel.updateOne(
                {"emailConfirmation.confirmationCode" : code},
                { $set: {
                        "emailConfirmation.isConfirmed" : true,
                        "emailConfirmation.confirmationCode": ''
                    }
                }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error("Error confirming email:", error);
            return false;
        }
    }
    async updateUserEmailConfirmation(
        _id: mongoose.Types.ObjectId,
        confirmationCode: string,
        expirationDate: string
    ): Promise<boolean|null> {
        try {
            const result = await UserModel.updateOne(
                {_id: _id},
                {
                    $set: {
                        "emailConfirmation.confirmationCode": confirmationCode,
                        "emailConfirmation.expirationDate": expirationDate
                    }
                }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error("Error updating email confirmation:", error);
            return false;
        }
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
            {_id: new mongoose.Types.ObjectId(userId)},
            {
                $set: {
                    "passwordHash": newPasswordHash,
                }
            }
        );
        return result.modifiedCount === 1;
    }
}
