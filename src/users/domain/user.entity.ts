import {UserDB} from '../routes/output/user.db';
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";
import {UserCreateInput} from "../routes/input/create-user.input";
import {v4 as uuidv4} from "uuid";
import {addHours} from "date-fns";

interface UserMethods {

};
type UserStatics = typeof UserEntity;
type UserModelType = Model<UserDB, {}, UserMethods> & UserStatics;
export type UserDocument = HydratedDocument<UserDB, UserMethods>;

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

class UserEntity {
    private constructor(
        public login: string,
        public passwordHash: string,
        public email: string,
        public createdAt: string,
        public emailConfirmation?: {
            isConfirmed: boolean,
            confirmationCode: string,
            expirationDate: string,
        }
    ) {}
    static createUser(userInputDto: UserCreateInput, passwordHash: string) {
        if (!userInputDto.login||userInputDto.login.length < 3) {
            throw new Error('Login must be at least 3 characters');
        }
        if(!userInputDto.email.includes('@')){
            throw new Error('Invalid email format');
        }
        return new UserModel({
            login: userInputDto.login,
            passwordHash: passwordHash,
            email: userInputDto.email,
            createdAt: new Date().toISOString(),
        })
    }
    static createUserWithConfirmationInfo(userInputDto: UserCreateInput, passwordHash: string) {
        if (!userInputDto.login||userInputDto.login.length < 3) {
            throw new Error('Login must be at least 3 characters');
        }
        if(!userInputDto.email.includes('@')){
            throw new Error('Invalid email format');
        }
        return new UserModel({
            login: userInputDto.login,
            passwordHash: passwordHash,
            email: userInputDto.email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                isConfirmed: false,
                confirmationCode: uuidv4(),
                expirationDate: addHours(new Date(), 24).toISOString(),
            }
        })
    }

}

userSchema.loadClass(UserEntity);

export const UserModel: UserModelType = model<UserDB,UserModelType>('user', userSchema);
