import {TokenBlacklistDB} from "../routes/types/token-blacklist.db";
import {tokenListCollection} from "../../db/mongo.bd";


export const blacklistRepository = {
    async insertToken(oldToken: TokenBlacklistDB): Promise<string> {
        const insertResult = await tokenListCollection.insertOne(oldToken);
        return insertResult.insertedId.toString();
    },
    async deleteToken(token: TokenBlacklistDB): Promise<void> {},
    async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
        const existing = await tokenListCollection.findOne({refreshTokenHash: tokenHash});
        return existing !== null;
    }
}