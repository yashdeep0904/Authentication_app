import { createClient } from 'redis';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config(); 

// We put your Upstash URL directly as the fallback. 
// If the .env file fails to load, it will just use this string and work perfectly!
const redisURL = process.env.REDIS_URL || "rediss://default:gQAAAAAAAd5wAAIgcDJkMGM0ZTg4MmQxNjI0MDFlYWM1ZGU2NGEyZDI5N2FjNQ@adjusted-jaguar-122480.upstash.io:6379"

const redisClient = createClient({
    url: redisURL,
    socket: {
        // The typeof check safely prevents the "is not a function" crash
        tls: typeof redisURL === 'string' && redisURL.startsWith('rediss://'), 
        rejectUnauthorized: false
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis connected successfully! 🚀'));

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error("Failed to connect to Redis:", error.message);
    }
};

export default redisClient;