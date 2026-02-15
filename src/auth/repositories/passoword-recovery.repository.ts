import {ObjectId, WithId} from "mongodb";
import {passwordRecoveryCollection} from "../../db/mongo.bd";
import {PasswordRecovery} from "../types/password-recovery";

export class PasswordRecoveryRepository {
    async addPasswordRecoveryData(_id: ObjectId, recoveryCode: string, expirationDate:string): Promise<boolean> {
        try {
            const result = await passwordRecoveryCollection.updateOne(
                {userId: _id.toString()},
                {
                    $set: {
                        "isUsed": false,
                        "passwordRecoveryCode": recoveryCode,
                        "passwordRecoveryExpiration": expirationDate
                    }
                },
                { upsert: true }
            );
            return result.modifiedCount === 1;
        } catch (error) {
            console.error("Error updating recovery code info:", error);
            return false;
        }
    }
    async findCode(recoveryCode: string): Promise<WithId<PasswordRecovery>|null> {
        return await passwordRecoveryCollection.findOne({passwordRecoveryCode: recoveryCode});
    }
    async changeStatusRecoveryCode(recoveryCode: string): Promise<void> {
        try {
            await passwordRecoveryCollection.updateOne(
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
}