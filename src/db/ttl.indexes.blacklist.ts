
import {Collection} from "mongodb";
import {TokenBlacklistDB} from "../auth/routes/types/token-blacklist.db";
//ttl indexes for blacklist
export async function createTTLIndex(tokenListCollection: Collection<TokenBlacklistDB>): Promise<void> {
    try {
        if (!tokenListCollection) throw new Error('Collection not initialized');

        const indexes = await tokenListCollection.indexes();
        const ttlIndexExists = indexes.some(
            index => index.name === 'expiresAt_ttl_index'
        );

        if (!ttlIndexExists) {
            await tokenListCollection.createIndex(
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