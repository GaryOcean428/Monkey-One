import { supabase } from '../supabase/config'
import type { Tables } from './types'
import { getRedisClient } from '../redis/config'

export class DatabaseService {
  private static instance: DatabaseService
  private readonly CACHE_TTL = 300 // 5 minutes in seconds

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // Generic CRUD operations with caching
  async create<T extends keyof Tables>(
    table: T,
    data: Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>
  ): Promise<Tables[T]> {
    const { data: result, error } = await supabase.from(table).insert(data).select().single()

    if (error) throw error
    return result as Tables[T]
  }

  async read<T extends keyof Tables>(
    table: T,
    id: string,
    useCache = true
  ): Promise<Tables[T] | null> {
    if (useCache) {
      const redis = await getRedisClient()
      const cacheKey = `${table}:${id}`
      const cached = await redis.get(cacheKey)

      if (cached) {
        return JSON.parse(cached)
      }
    }

    const { data, error } = await supabase.from(table).select('*').eq('id', id).single()

    if (error) {
      if (error.code === 'PGRST116') return null // Record not found
      throw error
    }

    if (data && useCache) {
      const redis = await getRedisClient()
      const cacheKey = `${table}:${id}`
      await redis.set(cacheKey, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      })
    }

    return data as Tables[T]
  }

  async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: Partial<Tables[T]>
  ): Promise<Tables[T]> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Invalidate cache
    const redis = await getRedisClient()
    await redis.del(`${table}:${id}`)

    return result as Tables[T]
  }

  async delete<T extends keyof Tables>(table: T, id: string): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) throw error

    // Invalidate cache
    const redis = await getRedisClient()
    await redis.del(`${table}:${id}`)
  }

  async query<T extends keyof Tables>(
    table: T,
    query: {
      select?: string
      eq?: Record<string, any>
      gt?: Record<string, any>
      lt?: Record<string, any>
      gte?: Record<string, any>
      lte?: Record<string, any>
      like?: Record<string, any>
      in?: Record<string, any[]>
      order?: Record<string, 'asc' | 'desc'>
      limit?: number
      offset?: number
    },
    useCache = true
  ): Promise<Tables[T][]> {
    const cacheKey = `${table}:query:${JSON.stringify(query)}`

    if (useCache) {
      const redis = await getRedisClient()
      const cached = await redis.get(cacheKey)

      if (cached) {
        return JSON.parse(cached)
      }
    }

    let queryBuilder = supabase.from(table).select(query.select || '*')

    if (query.eq) {
      Object.entries(query.eq).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value)
      })
    }

    if (query.gt) {
      Object.entries(query.gt).forEach(([key, value]) => {
        queryBuilder = queryBuilder.gt(key, value)
      })
    }

    if (query.lt) {
      Object.entries(query.lt).forEach(([key, value]) => {
        queryBuilder = queryBuilder.lt(key, value)
      })
    }

    if (query.gte) {
      Object.entries(query.gte).forEach(([key, value]) => {
        queryBuilder = queryBuilder.gte(key, value)
      })
    }

    if (query.lte) {
      Object.entries(query.lte).forEach(([key, value]) => {
        queryBuilder = queryBuilder.lte(key, value)
      })
    }

    if (query.like) {
      Object.entries(query.like).forEach(([key, value]) => {
        queryBuilder = queryBuilder.like(key, value)
      })
    }

    if (query.in) {
      Object.entries(query.in).forEach(([key, values]) => {
        queryBuilder = queryBuilder.in(key, values)
      })
    }

    if (query.order) {
      Object.entries(query.order).forEach(([key, direction]) => {
        queryBuilder = queryBuilder.order(key, { ascending: direction === 'asc' })
      })
    }

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit)
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 10) - 1)
    }

    const { data, error } = await queryBuilder

    if (error) throw error

    if (data && useCache) {
      const redis = await getRedisClient()
      await redis.set(cacheKey, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      })
    }

    return data as Tables[T][]
  }

  // Cache management
  async invalidateCache(pattern: string): Promise<void> {
    const redis = await getRedisClient()
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }

  async clearCache(): Promise<void> {
    const redis = await getRedisClient()
    await redis.flushDb()
  }
}

export const db = DatabaseService.getInstance()
