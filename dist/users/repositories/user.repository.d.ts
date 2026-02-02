import { UserDB } from "../routes/output/user.db";
import { ObjectId } from "mongodb";
export declare const usersRepository: {
    createUser(newUser: UserDB): Promise<string>;
    deleteUser(id: string): Promise<void>;
    confirmEmail(code: string): Promise<boolean | null>;
    updateUserEmailConfirmation(_id: ObjectId, confirmationCode: string, expirationDate: string): Promise<boolean | null>;
};
//# sourceMappingURL=user.repository.d.ts.map