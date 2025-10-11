import { createClient } from 'redis'

const redisHost = import.meta.env.VITE_REDIS_HOST
const redisPort = parseInt(import.meta.env.VITE_REDIS_PORT || '12318')
const redisPassword = import.meta.env.VITE_REDIS_PASSWORD
const redisUsername = import.meta.env.VITE_REDIS_USERNAME

if (!redisHost || !redisPassword) {
  throw new Error('Missing Redis environment variables')
}

export const createRedisClient = async () => {
  const client = createClient({
    socket: {
      host: redisHost,
      port: redisPort,
      reconnectStrategy: retries => {
        if (retries > 10) return new Error('Redis connection retries exhausted')
        return Math.min(retries * 100, 3000)
      },
      connectTimeout: 5000,
    },
    username: redisUsername || 'default',
    password: redisPassword,
    pingInterval: 1000,
    enableOfflineQueue: false,
  })

  client.on('error', err => {
    console.error('Redis Client Error:', err)
  })

  client.on('connect', () => {
    console.log('Redis Client Connected')
  })

  client.on('ready', () => {
    console.log('Redis Client Ready')
  })

  client.on('reconnecting', () => {
    console.log('Redis Client Reconnecting')
  })

  client.on('end', () => {
    console.log('Redis Client Connection Ended')
    redisClient = null // Clear the cached client
  })

  try {
    await client.connect()
    return client
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

// For cases where we need a synchronous reference
let redisClient: ReturnType<typeof createClient> | null = null

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient()
  }
  return redisClient
}
