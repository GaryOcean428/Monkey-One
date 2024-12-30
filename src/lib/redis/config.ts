import { createClient } from 'redis';

const redisHost = import.meta.env.VITE_REDIS_HOST;
const redisPort = parseInt(import.meta.env.VITE_REDIS_PORT || '12318');
const redisPassword = import.meta.env.VITE_REDIS_PASSWORD;
const redisUsername = import.meta.env.VITE_REDIS_USERNAME;

if (!redisHost || !redisPassword) {
  throw new Error('Missing Redis environment variables');
}

export const createRedisClient = async () => {
  const client = createClient({
    socket: {
      host: redisHost,
      port: redisPort,
    },
    username: redisUsername || 'default',
    password: redisPassword,
    pingInterval: 1000, // Ping every second to keep connection alive
  });

  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('Redis Client Connected'));
  client.on('ready', () => console.log('Redis Client Ready'));
  client.on('reconnecting', () => console.log('Redis Client Reconnecting'));
  client.on('end', () => console.log('Redis Client Connection Ended'));

  await client.connect();
  return client;
};

// For cases where we need a synchronous reference
let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
};
