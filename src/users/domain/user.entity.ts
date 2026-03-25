import {UserDB} from '../routes/output/user.db';
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument, ObjectId} from "mongoose";

type UserModelType = Model<UserDB>;
export type UserDocument = HydratedDocument<UserDB>;

const userSchema = new mongoose.Schema<UserDB>({
    login: {type: String, required: true, minlength: 1},
    passwordHash: {type: String, required: true, minlength: 1},
    email: {type: String, required: true, minlength: 5},
    createdAt: {type: String, required: true},
    emailConfirmation: {
        type: {
            isConfirmed: {type: Boolean, required: true, default: false},
            confirmationCode: {type: String, required: false},
            expirationDate: {type: String,  required: false},
        },
        required: false,
        _id: false
    },
});

export const UserModel = model<UserDB,UserModelType>('user', userSchema);
