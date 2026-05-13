import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {PasswordRecovery} from "../types/password-recovery";
import { v4 as uuidv4 } from 'uuid';
import { addHours} from 'date-fns';

interface PasswordRecoveryMethods {
    use(code: string): void;
    isValid(code: string): boolean
}
type PasswordRecoveryStatics = typeof PasswordRecoveryEntity;
type PasswordRecoveryModelType = Model<PasswordRecovery, {}, PasswordRecoveryMethods> & PasswordRecoveryStatics;
export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery, PasswordRecoveryMethods>;

const passwordRecoverySchema = new mongoose.Schema<PasswordRecovery>({
    userId: {type: String, required: true, minlength: 1},
    isUsed: {type: Boolean,required: true, default: false},
    passwordRecoveryCode: {type: String, required: true, minlength: 1},
    passwordRecoveryExpiration: {type: Date, required: true},
    createdAt: {type: Date, required: true},
});
passwordRecoverySchema.index(
    { passwordRecoveryExpiration: 1 },
    { expireAfterSeconds: 0, name: 'pass_exp_ttl_index' }
);
export class PasswordRecoveryEntity {
    private constructor(
        public readonly userId: string,
        public isUsed: boolean = false,
        public passwordRecoveryCode: string,
        public passwordRecoveryExpiration: Date,
        public readonly createdAt: Date = new Date(),
    )
    {}
    static createPasswordRecovery(userId: string): PasswordRecoveryEntity {
        const recoveryCode: string = uuidv4();
        const expirationDate: Date = addHours(new Date(), 24);

        return new PasswordRecoveryEntity(
            userId,
            false,
            recoveryCode,
            expirationDate,
            new Date()
        );
    }
    static restore (
        userId: string,
        isUsed: boolean,
        passwordRecoveryCode: string,
        passwordRecoveryExpiration: Date,
        createdAt: Date,
    ): PasswordRecoveryEntity {
        return new PasswordRecoveryEntity(
            userId,
            isUsed,
            passwordRecoveryCode,
            passwordRecoveryExpiration,
            createdAt
        );
    }
    use(code: string): void {
        if(this.isUsed){
            throw new Error('Recovery code is already in used');
        }
        if(this.passwordRecoveryCode !== code){
            throw new Error('Invalid recovery code ');
        }
        if(this.passwordRecoveryExpiration < new Date()){
           throw new Error('Recovery expired expiration');
        }
        this.isUsed = true;
    }
    isValid(code: string): boolean {
        return !this.isUsed && this.passwordRecoveryCode === code && this.passwordRecoveryExpiration > new Date();
    }
}
passwordRecoverySchema.loadClass(PasswordRecoveryEntity);
export const PasswordRecoveryModel = model<PasswordRecovery, PasswordRecoveryModelType>('passwordRecovery', passwordRecoverySchema);
