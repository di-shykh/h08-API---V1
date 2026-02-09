import {UserDB} from "../routes/output/user.db";
import {userCollection} from "../../db/mongo.bd";
import {ObjectId, WithId} from "mongodb";
import {RepositoryNotFoundError} from "../../core/errors/repository-not-found.error";
import {normalizeEmail} from "../../core/helpers/normolize-email";

export class usersRepository {
    static async createUser(newUser: UserDB): Promise<string> {
        const insertedUser = await userCollection.insertOne(newUser);
        return insertedUser.insertedId.toString();
    }
    static async deleteUser(id: string): Promise<void> {
        const deletedUser = await userCollection.deleteOne({_id: new ObjectId(id)});
        if(deletedUser.deletedCount<1) {
            throw new RepositoryNotFoundError("User not found");
        }
        return;
    }

    static async confirmEmail(code: string): Promise<boolean|null> {
        try {
            const result = await userCollection.updateOne(
                {"emailConfirmation.confirmationCode" : code},
                { $set: {
                        "emailConfirmation.isConfirmed" : true,
                        "emailConfirmation.confirmationCode": null
                    }
                }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error("Error confirming email:", error);
            return false;
        }
    }
    static async updateUserEmailConfirmation(_id: ObjectId, confirmationCode: string, expirationDate: string): Promise<boolean|null> {
        try {
            const result = await userCollection.updateOne(
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
    static async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserDB>|null> {
        const normalizedEmail = normalizeEmail(loginOrEmail);
        return await userCollection.findOne({
            $or: [{login: loginOrEmail }, { email: normalizedEmail }],
        });
    }
    static async isEmailUnique(email: string): Promise<Boolean> {
        const normalizedEmail = normalizeEmail(email);
        const user = await userCollection.findOne({email: normalizedEmail});
        return !user;
    }
    static async isLoginUnique(login: string): Promise<Boolean> {
        const loginUser = login.trim();
        const user = await userCollection.findOne({login: loginUser});
        return !user;
    }
    static async findByConfirmationCode(code: string): Promise<WithId<UserDB>| null> {
        const user: WithId<UserDB>|null = await userCollection.findOne({"emailConfirmation.confirmationCode": code});
        return user;
    }
    static async findUserByEmail(email: string): Promise<WithId<UserDB>| null> {
        const normalizedEmail = normalizeEmail(email);
        const user: WithId<UserDB>|null = await userCollection.findOne({"email":normalizedEmail})
        return user;
    }
}