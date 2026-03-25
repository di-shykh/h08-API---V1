import mongoose from "mongoose";

export type UserDB = {
    _id?: mongoose.Types.ObjectId;
    login: string;
    passwordHash: string;
    email: string;
    createdAt: string;
    emailConfirmation?: {
        isConfirmed: boolean;
        confirmationCode: string;
        expirationDate: string;
    };
}