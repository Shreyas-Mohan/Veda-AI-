import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// We pass the URL directly and force IPv4 to prevent DNS timeout issues
const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
    console.log('Redis connected successfully!');
});

redisConnection.on('error', (err) => {
    console.error('[Redis Error] Connection failed:', err.message);
});

export default redisConnection;