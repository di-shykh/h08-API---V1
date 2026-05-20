import mongoose from 'mongoose';
import { SETTINGS } from '../core/settings/settings';

// Подключения к бд
export async function runDB(url?: string): Promise<void> {
    try {
        const mongoUrl = url || SETTINGS.MONGO_URL;
        await mongoose.connect(mongoUrl, {
            dbName: SETTINGS.DB_NAME,
        });
       console.log("MongoDB Connected");
        await syncAllIndexes();
    }
    catch (error) {
        console.log("No connection.");
        await mongoose.disconnect();
    }
}
// для тестов
export async function stopDb() {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
}
async function syncAllIndexes(): Promise<void> {
    try{
        const models = mongoose.models;
        for(const model in models) {
            await models[model].syncIndexes();
            console.log(`✅ Synced indexes for ${model}`);
        }

    } catch (e) {
        console.error('Failed to sync indexes:', e);
    }
}
