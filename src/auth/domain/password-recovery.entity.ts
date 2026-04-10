import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {PasswordRecovery} from "../types/password-recovery";

type PasswordRecoveryModelType = Model<PasswordRecovery>;
export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>;
const passwordRecoverySchema = new mongoose.Schema<PasswordRecovery>({
    userId: {type: String, required: true, minlength: 1},
    isUsed: {type: Boolean,required: true, default: false},
    passwordRecoveryCode: {type: String, required: true, minlength: 1},
    passwordRecoveryExpiration: {type: Date, required: true},
});
passwordRecoverySchema.index(
    { passwordRecoveryExpiration: 1 },
    { expireAfterSeconds: 0, name: 'pass_exp_ttl_index' }
);
export const PasswordRecoveryModel = model<PasswordRecovery, PasswordRecoveryModelType>('passwordRecovery', passwordRecoverySchema);

