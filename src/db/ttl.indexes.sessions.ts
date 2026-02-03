
import {Collection} from "mongodb";
import {Session} from "../securityDevices/domain/session";

export async function createTTLIndex(sessionCollection: Collection<Session>): Promise<void> {
    try {
        if (!sessionCollection) throw new Error('Collection not initialized');

        const indexes = await sessionCollection.indexes();
        const ttlIndexExists = indexes.some(
            index => index.name === 'expiresAt_ttl_index'
        );

        if (!ttlIndexExists) {
            await sessionCollection.createIndex(
                { expiresAt: 1 },
                {
                    expireAfterSeconds: 0,
                    name: 'expiresAt_ttl_index',
                    background: true
                }
            );
            console.log('TTL index created');
        } else {
            console.log('TTL index already exists');
        }
    } catch (error) {
        console.error('Failed to create TTL index:', error);
        throw error;
    }
}