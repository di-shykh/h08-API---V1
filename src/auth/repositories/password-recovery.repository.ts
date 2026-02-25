import {ObjectId, WithId} from "mongodb";
import {passwordRecoveryCollection} from "../../db/mongo.bd";
import {PasswordRecovery} from "../types/password-recovery";
import {userCollection} from "../../db/mongo.bd";
import { injectable } from 'inversify';

@injectable()
export class PasswordRecoveryRepository {
    async addPasswordRecoveryData(_id: ObjectId, recoveryCode: string, expirationDate:string): Promise<boolean> {
        try {
            const result = await passwordRecoveryCollection.updateOne(
                {userId: _id.toString()},
                {
                    $set: {
                        userId: _id.toString(),
                        "isUsed": false,
                        "passwordRecoveryCode": recoveryCode,
                        "passwordRecoveryExpiration": expirationDate,
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
    async findCodeByEmail(email: string): Promise<string | null> {
        const user = await userCollection.findOne({ email });
        if (!user) return null;
        const recovery = await passwordRecoveryCollection.findOne({ userId: user._id.toString() });
        return recovery?.passwordRecoveryCode || null;
    }
}