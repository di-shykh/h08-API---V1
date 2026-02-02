import { TokenBlacklistDB } from "../routes/types/token-blacklist.db";
export declare const blacklistRepository: {
    insertToken(oldToken: TokenBlacklistDB): Promise<string>;
    deleteToken(token: TokenBlacklistDB): Promise<void>;
    isTokenBlacklisted(tokenHash: string): Promise<boolean>;
};
//# sourceMappingURL=blacklist.repository.d.ts.map