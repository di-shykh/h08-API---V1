import { Collection } from "mongodb";
import { TokenBlacklistDB } from "../auth/routes/types/token-blacklist.db";
export declare function createTTLIndex(tokenListCollection: Collection<TokenBlacklistDB>): Promise<void>;
//# sourceMappingURL=ttl.indexes.blacklist.d.ts.map