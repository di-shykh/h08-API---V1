import { Collection, Db, MongoClient } from 'mongodb';
import { Blog } from '../blogs/types/blog'
import { Post } from '../posts/domain/post';
import { SETTINGS } from '../core/settings/settings';
import {UserDB} from "../users/routes/output/user.db";
import {CommentDB} from "../comments/routes/output/commnent.db";
import {createTTLIndexes} from "./ttl.indexes.sessions";
import {Session} from "../securityDevices/domain/session";
import {RateLimit} from "../auth/types/rate-limit";

const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const SESSION_COLLECTION_NAME = 'sessions';
const RATE_LIMIT_COLLECTION_NAME = 'rateLimit';

export let client: MongoClient;
export let blogCollection: Collection<Blog>;
export let postCollection: Collection<Post>;
export let userCollection: Collection<UserDB>;
export let commentCollection: Collection<CommentDB>;
export let sessionCollection: Collection<Session>;
export let rateLimitCollection: Collection<RateLimit>;

// Подключения к бд
export async function runDB(url: string): Promise<void> {
    client = new MongoClient(url);
    const db: Db = client.db(SETTINGS.DB_NAME);

    try {
        // Инициализация коллекций
        blogCollection = db.collection<Blog>(BLOG_COLLECTION_NAME);
        postCollection = db.collection<Post>(POST_COLLECTION_NAME);
        userCollection = db.collection<UserDB>(USERS_COLLECTION_NAME)
        commentCollection = db.collection<CommentDB>(COMMENTS_COLLECTION_NAME);
        sessionCollection = db.collection<Session>(SESSION_COLLECTION_NAME);
        rateLimitCollection = db.collection<RateLimit>(COMMENTS_COLLECTION_NAME);
        await client.connect();
        await db.command({ ping: 1 });
        console.log('✅ Connected to the database');
        // Создаем индексы
        await createCollectionsIfNotExist(db);
        await createTTLIndexes();
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

async function createCollectionsIfNotExist(db: Db): Promise<void> {
    const collections = await db.listCollections().toArray();
    const existingCollections = new Set(collections.map(c => c.name));

    // Создаём только те коллекции, которых нет
    const collectionsToCreate = [
        { name: BLOG_COLLECTION_NAME, options: {} },
        { name: POST_COLLECTION_NAME, options: {} },
        { name: USERS_COLLECTION_NAME, options: {} },
        { name: COMMENTS_COLLECTION_NAME, options: {} },
        { name: SESSION_COLLECTION_NAME, options: {} },
        { name: RATE_LIMIT_COLLECTION_NAME, options: {} },
    ];

    for (const { name, options } of collectionsToCreate) {
        if (!existingCollections.has(name)) {
            await db.createCollection(name, options);
            console.log(`✅ Created collection: ${name}`);
        }
    }
}
