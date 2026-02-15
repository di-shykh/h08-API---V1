import dotenv from "dotenv";

dotenv.config();

export const SETTINGS = {
    PORT: process.env.PORT || 5001,
    MONGO_URL_TEST: process.env.MONGO_URL_TEST || 'mongodb://0.0.0.0:27017/test_db',
    MONGO_URL:
        process.env.MONGO_URL || 'mongodb://0.0.0.0:27017',
    DB_NAME: process.env.DB_NAME || 'h03-db',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_FROM: process.env.EMAIL_FROM,
};

