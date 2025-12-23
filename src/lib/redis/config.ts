import { createClient } from 'redis'

const redisHost = import.meta.env.VITE_REDIS_HOST
const redisPort = parseInt(import.meta.env.VITE_REDIS_PORT || '12318')
const redisPassword = import.meta.env.VITE_REDIS_PASSWORD
const redisUsername = import.meta.env.VITE_REDIS_USERNAME

// Allow tests to run without Redis configured
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'

export const createRedisClient = async () => {
  if (!redisHost || !redisPassword) {
    if (isTestEnv) {
      // Return a mock client for tests
      return null as any
    }
    throw new Error('Missing Redis environment variables')
  }

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
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  })

  client.on('error', err => {
    console.error('Redis Client Error:', err)
    // Emit event for monitoring
    process.emit('redisError', err)
  })

  client.on('connect', () => {
    console.log('Redis Client Connected')
    process.emit('redisConnected')
  })

  client.on('ready', () => {
    console.log('Redis Client Ready')
    process.emit('redisReady')
  })

  client.on('reconnecting', () => {
    console.log('Redis Client Reconnecting')
    process.emit('redisReconnecting')
  })

  client.on('end', () => {
    console.log('Redis Client Connection Ended')
    process.emit('redisEnded')
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
