import {PasswordRecovery} from "../types/password-recovery";
import { injectable } from 'inversify';
import {PasswordRecoveryDocument, PasswordRecoveryModel } from "../domain/password-recovery.entity";
import {UserModel} from "../../users/domain/user.entity"

@injectable()
export class PasswordRecoveryRepository {
    async save(passwordRecovery: PasswordRecoveryDocument): Promise<void> {
        await passwordRecovery.save();
    }
    async addPasswordRecoveryData(_id: string, passwordRecoveryData: PasswordRecovery): Promise<boolean> {
        try {
            const passwordRecovery = new PasswordRecoveryModel(passwordRecoveryData);
            await this.save(passwordRecovery);
            const result = await PasswordRecoveryModel.updateOne(
                {userId: _id.toString()},
                {
                    $set: {
                        createdAt: new Date().toISOString()
                    }
                },
                { upsert: true }
            );
            return result.modifiedCount === 1 || result.upsertedCount === 1 || result.matchedCount === 1;
        } catch (error) {
            console.error("Error updating recovery code info:", error);
            return false;
        }
    }
    async findCode(recoveryCode: string): Promise<PasswordRecoveryDocument|null> {
        return PasswordRecoveryModel.findOne({passwordRecoveryCode: recoveryCode});
    }
    async changeStatusRecoveryCode(recoveryCode: string): Promise<void> {
        try {
            await PasswordRecoveryModel.updateOne(
                {passwordRecoveryCode: recoveryCode},
                {
                    $set: {
                        "isUsed": true,
                    }
                }
            )
        } catch (error) {
            console.error("Error updating recovery code info:", error);
            return;
        }
    }
    async findCodeByEmail(email: string): Promise<string | null> {
        const user = await UserModel.findOne({ email });
        if (!user) return null;
        const recovery = await PasswordRecoveryModel.findOne({ userId: user._id.toString() });
        return recovery?.passwordRecoveryCode || null;
    }
}