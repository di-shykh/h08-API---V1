import {UserDB} from '../routes/output/user.db';
import * as mongoose from 'mongoose';
import {Model, model, HydratedDocument} from "mongoose";
import {UserCreateInput} from "../routes/input/create-user.input";
import {addHours} from "date-fns";
import {ResultObject} from "../../core/result/result.type";

interface UserMethods {
    confirmEmail(code: string): void;
    updateEmailConfirmationData(code: string): void;
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
    static createUserWithConfirmationInfo(userInputDto: UserCreateInput, passwordHash: string, confirmationCode: string) {
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
                confirmationCode: confirmationCode,
                expirationDate: addHours(new Date(), 24).toISOString(),
            }
        })
    }
    confirmEmail(confirmationCode: string) {
        if(!confirmationCode||confirmationCode.length!==36){
            throw new Error('Invalid confirmation code format');
        }
        if(!this.emailConfirmation){
            return ResultObject.BadRequest('code', 'Code does not exist');
        }
        if(this.emailConfirmation.isConfirmed){
            throw new Error('Registration is already confirmed');
        }
        const dateNow = new Date();
        const expirationDate = new Date(this.emailConfirmation.expirationDate);
        if(dateNow > expirationDate){
            throw new Error( 'Code expired');
        }
        if(this.emailConfirmation.confirmationCode!==confirmationCode){
            throw new Error('Invalid confirmation code');
        }
        this.emailConfirmation.isConfirmed = true;
        this.emailConfirmation.confirmationCode = '';
        this.emailConfirmation.expirationDate = '';
    }
    updateEmailConfirmationData(code: string): void {
        if(!this.emailConfirmation){
            throw new Error('Email confirmation does not exist');
        }
        if(this.emailConfirmation.isConfirmed){
            throw new Error('Email is already confirmed');
        }
        this.emailConfirmation.confirmationCode = code;
        this.emailConfirmation.expirationDate = addHours(new Date(), 24).toISOString();
    }
}

userSchema.loadClass(UserEntity);

export const UserModel: UserModelType = model<UserDB,UserModelType>('user', userSchema);
