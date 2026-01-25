import {TokenBlacklistDb} from "../routes/types/token-blacklist.db";
import {tokenListCollection} from "../../db/mongo.bd";


export const blacklistRepository = {
    async insertToken(oldToken: TokenBlacklistDb): Promise<string> {
        const insertResult = await tokenListCollection.insertOne(oldToken);
        return insertResult.insertedId.toString();
    },
    async deleteToken(token: TokenBlacklistDb): Promise<void> {},
    async findToken(token: TokenBlacklistDb): Promise<boolean> {

    }
}