import { beforeAll, afterAll, afterEach } from 'vitest'
import { getRedisClient } from '../lib/redis/config'
import { supabase } from '../lib/supabase/config'

beforeAll(async () => {
  // Initialize Redis client
  const redis = await getRedisClient()
  await redis.ping()

  // Initialize Supabase client
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
})

afterEach(async () => {
  // Clean up Redis test data
  const redis = await getRedisClient()
  const testKeys = await redis.keys('test:*')
  if (testKeys.length > 0) {
    await redis.del(testKeys)
  }

  // Clean up Supabase test data
  const { error } = await supabase.rpc('cleanup_test_data')
  if (error) throw error
})

afterAll(async () => {
  // Close Redis connection
  const redis = await getRedisClient()
  await redis.quit()
})
