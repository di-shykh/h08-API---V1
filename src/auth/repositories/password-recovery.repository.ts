import { injectable } from 'inversify';
import {PasswordRecoveryModel } from "../domain/password-recovery.entity";
import {UserModel} from "../../users/domain/user.entity";
import { PasswordRecoveryEntity } from '../domain/password-recovery.entity';

@injectable()
export class PasswordRecoveryRepository {
    async save(recovery: PasswordRecoveryEntity): Promise<boolean> {
        try {
            const result = await PasswordRecoveryModel.findOneAndUpdate(
                {userId: recovery.userId},
                {   userId: recovery.userId,
                    passwordRecoveryCode: recovery.passwordRecoveryCode,
                    passwordRecoveryExpiration: recovery.passwordRecoveryExpiration,
                    isUsed: recovery.isUsed,
                    createdAt: new Date().toISOString()
                },
                { upsert: true}
            );
            return true;
        } catch (error) {
            console.error("Error updating recovery code info:", error);
            return false;
        }
    }
    async findByCode(recoveryCode: string): Promise<PasswordRecoveryEntity|null> {
        const result = await PasswordRecoveryModel.findOne({passwordRecoveryCode: recoveryCode});
        if(!result) return null;
        return PasswordRecoveryEntity.restore(
            result.userId,
            result.isUsed,
            result.passwordRecoveryCode,
            result.passwordRecoveryExpiration,
            result.createdAt
        );
    }
}