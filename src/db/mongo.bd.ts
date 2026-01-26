import { Collection, Db, MongoClient } from 'mongodb';
import { Blog } from '../blogs/types/blog'
import { Post } from '../posts/domain/post';
import { SETTINGS } from '../core/settings/settings';
import {UserDB} from "../users/routes/output/user.db";
import {CommentDB} from "../comments/routes/output/commnent.db";
import {TokenBlacklistDB} from "../auth/routes/types/token-blacklist.db";
import {createTTLIndex} from "./ttl.indexes.blacklist";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const BLACKLIST_COLLECTION_NAME = 'tokenBlacklist';

export let client: MongoClient;
export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let userCollection: Collection<UserDB>;
export let commentCollection: Collection<CommentDB>;
export let tokenListCollection: Collection<TokenBlacklistDB>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
    client = new MongoClient(url);
    const db: Db = client.db(SETTINGS.DB_NAME);

    // Инициализация коллекций
    blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
    postCollection = db.collection<Post>(POST_COLLECTION_NAME);
    userCollection = db.collection<UserDB>(USERS_COLLECTION_NAME)
    commentCollection = db.collection<CommentDB>(COMMENTS_COLLECTION_NAME);
    tokenListCollection = db.collection<TokenBlacklistDB>(BLACKLIST_COLLECTION_NAME);


    try {
        await client.connect();
        await db.command({ ping: 1 });
        console.log('✅ Connected to the database');
        // Создаем индексы
        await createTTLIndex(tokenListCollection);
    } catch (e) {
        await client.close();
        throw new Error(`❌ Database not connected: ${e}`);
    }
}
// для тестов
export async function stopDb() {
    if (!client) {
        throw new Error(`❌ No active client`);
    }
    await client.close();
}
