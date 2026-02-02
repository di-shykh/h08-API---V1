import { Collection, MongoClient } from 'mongodb';
import { Blog } from '../blogs/types/blog';
import { Post } from '../posts/domain/post';
import { UserDB } from "../users/routes/output/user.db";
import { CommentDB } from "../comments/routes/output/commnent.db";
import { TokenBlacklistDB } from "../auth/routes/types/token-blacklist.db";
export declare let client: MongoClient;
export declare let blogCollection: Collection<Blog>;
export declare let postCollection: Collection<Post>;
export declare let userCollection: Collection<UserDB>;
export declare let commentCollection: Collection<CommentDB>;
export declare let tokenListCollection: Collection<TokenBlacklistDB>;
export declare function runDB(url: string): Promise<void>;
export declare function stopDb(): Promise<void>;
//# sourceMappingURL=mongo.bd.d.ts.map