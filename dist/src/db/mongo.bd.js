"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionCollection = exports.commentCollection = exports.userCollection = exports.postCollection = exports.blogCollection = exports.client = void 0;
exports.runDB = runDB;
exports.stopDb = stopDb;
const mongodb_1 = require("mongodb");
const settings_1 = require("../core/settings/settings");
const ttl_indexes_sessions_1 = require("./ttl.indexes.sessions");
const BLOG_COLLECTION_NAME = 'blogs';
const POST_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';
const COMMENTS_COLLECTION_NAME = 'comments';
const SESSION_COLLECTION_NAME = 'sessions';
// Подключения к бд
function runDB(url) {
    return __awaiter(this, void 0, void 0, function* () {
        exports.client = new mongodb_1.MongoClient(url);
        const db = exports.client.db(settings_1.SETTINGS.DB_NAME);
        try {
            // Инициализация коллекций
            exports.blogCollection = db.collection(BLOG_COLLECTION_NAME);
            exports.postCollection = db.collection(POST_COLLECTION_NAME);
            exports.userCollection = db.collection(USERS_COLLECTION_NAME);
            exports.commentCollection = db.collection(COMMENTS_COLLECTION_NAME);
            exports.sessionCollection = db.collection(SESSION_COLLECTION_NAME);
            yield exports.client.connect();
            yield db.command({ ping: 1 });
            console.log('✅ Connected to the database');
            // Создаем индексы
            yield createCollectionsIfNotExist(db);
            yield (0, ttl_indexes_sessions_1.createTTLIndex)(exports.sessionCollection);
        }
        catch (e) {
            yield exports.client.close();
            throw new Error(`❌ Database not connected: ${e}`);
        }
    });
}
// для тестов
function stopDb() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.client) {
            throw new Error(`❌ No active client`);
        }
        yield exports.client.close();
    });
}
function createCollectionsIfNotExist(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = yield db.listCollections().toArray();
        const existingCollections = new Set(collections.map(c => c.name));
        // Создаём только те коллекции, которых нет
        const collectionsToCreate = [
            { name: BLOG_COLLECTION_NAME, options: {} },
            { name: POST_COLLECTION_NAME, options: {} },
            { name: USERS_COLLECTION_NAME, options: {} },
            { name: COMMENTS_COLLECTION_NAME, options: {} },
            { name: SESSION_COLLECTION_NAME, options: {} },
        ];
        for (const { name, options } of collectionsToCreate) {
            if (!existingCollections.has(name)) {
                yield db.createCollection(name, options);
                console.log(`✅ Created collection: ${name}`);
            }
        }
    });
}
//# sourceMappingURL=mongo.bd.js.map