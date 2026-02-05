import {Collection} from "mongodb";
import {Session} from "../securityDevices/domain/session";
import {RateLimit} from "../auth/types/rate-limit";

export async function createTTLIndexes(): Promise<void> {
    try {
        // Получите коллекции из вашего mongo.bd файла
        const { sessionCollection, rateLimitCollection } = await import('../db/mongo.bd');

        // TTL для сессий (предполагаем, что expiresAt - это дата истечения)
        const sessionIndexes = await sessionCollection.indexes();
        if (!sessionIndexes.some(idx => idx.name === 'exp_ttl_index')) {
            await sessionCollection.createIndex(
                { exp: 1 },
                { expireAfterSeconds: 0, name: 'exp_ttl_index' }
            );
            console.log('✅ Session TTL index created');
        }

        // TTL для rate limit (удалять записи старше 10 секунд)
        const rateLimitIndexes = await rateLimitCollection.indexes();
        if (!rateLimitIndexes.some(idx => idx.name === 'date_ttl_index')) {
            await rateLimitCollection.createIndex(
                { date: 1 },
                { expireAfterSeconds: 10, name: 'date_ttl_index' }
            );
            console.log('✅ Rate limit TTL index created (10s retention)');
        }

    } catch (error) {
        console.error('Failed to create TTL indexes:', error);
        throw error;
    }
}