import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../../lib/database/DatabaseService'
import { cache } from '../../lib/cache/CacheService'
import { CreateProfileSchema } from '../../lib/database/models/Profile'
import { v4 as uuidv4 } from 'uuid'

describe('DatabaseService Integration Tests', () => {
  const testUserId = uuidv4()

  beforeEach(async () => {
    await cache.clear()
  })

  describe('CRUD Operations', () => {
    it('should create and retrieve a profile', async () => {
      const profile = {
        user_id: testUserId,
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
      }

      // Validate with Zod schema
      const validProfile = CreateProfileSchema.parse(profile)

      // Create profile
      const created = await db.create('profiles', validProfile)
      expect(created).toMatchObject(profile)
      expect(created.id).toBeDefined()

      // Retrieve profile
      const retrieved = await db.read('profiles', created.id)
      expect(retrieved).toMatchObject(created)
    })

    it('should update a profile', async () => {
      // Create initial profile
      const profile = await db.create('profiles', {
        user_id: testUserId,
        username: 'oldname',
      })

      // Update profile
      const updated = await db.update('profiles', profile.id, {
        username: 'newname',
      })
      expect(updated.username).toBe('newname')

      // Verify cache is invalidated
      const cached = await cache.get(`profiles:${profile.id}`)
      expect(cached).toBeNull()
    })

    it('should delete a profile', async () => {
      // Create profile
      const profile = await db.create('profiles', {
        user_id: testUserId,
        username: 'todelete',
      })

      // Delete profile
      await db.delete('profiles', profile.id)

      // Verify deletion
      const retrieved = await db.read('profiles', profile.id)
      expect(retrieved).toBeNull()

      // Verify cache is invalidated
      const cached = await cache.get(`profiles:${profile.id}`)
      expect(cached).toBeNull()
    })
  })

  describe('Query Operations', () => {
    it('should query profiles with filters', async () => {
      // Create test profiles
      const profiles = await Promise.all([
        db.create('profiles', {
          user_id: testUserId,
          username: 'user1',
          status: 'active',
        }),
        db.create('profiles', {
          user_id: testUserId,
          username: 'user2',
          status: 'inactive',
        }),
      ])

      // Query active profiles
      const activeProfiles = await db.query('profiles', {
        eq: { status: 'active' },
      })
      expect(activeProfiles).toHaveLength(1)
      expect(activeProfiles[0].username).toBe('user1')

      // Query with multiple filters
      const results = await db.query('profiles', {
        eq: { user_id: testUserId },
        order: { created_at: 'desc' },
        limit: 1,
      })
      expect(results).toHaveLength(1)
    })

    it('should handle complex queries with joins', async () => {
      // Create test data
      const profile = await db.create('profiles', {
        user_id: testUserId,
        username: 'testuser',
      })

      const experience = await db.create('experiences', {
        user_id: testUserId,
        content: 'Test experience',
        metadata: { type: 'test' },
      })

      // Query with joins
      const results = await db.query('profiles', {
        select: '*, experiences(*)',
        eq: { user_id: testUserId },
      })

      expect(results).toHaveLength(1)
      expect(results[0].experiences).toBeDefined()
    })
  })

  describe('Cache Operations', () => {
    it('should cache read operations', async () => {
      // Create profile
      const profile = await db.create('profiles', {
        user_id: testUserId,
        username: 'cachetest',
      })

      // First read (cache miss)
      const start1 = Date.now()
      const result1 = await db.read('profiles', profile.id)
      const duration1 = Date.now() - start1

      // Second read (cache hit)
      const start2 = Date.now()
      const result2 = await db.read('profiles', profile.id)
      const duration2 = Date.now() - start2

      expect(result1).toEqual(result2)
      expect(duration2).toBeLessThan(duration1)
    })

    it('should handle cache invalidation', async () => {
      // Create profile
      const profile = await db.create('profiles', {
        user_id: testUserId,
        username: 'invalidatetest',
      })

      // Cache the profile
      await db.read('profiles', profile.id)

      // Update profile (should invalidate cache)
      await db.update('profiles', profile.id, {
        username: 'newname',
      })

      // Verify cache is invalidated
      const cached = await cache.get(`profiles:${profile.id}`)
      expect(cached).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle not found errors', async () => {
      const result = await db.read('profiles', 'nonexistent')
      expect(result).toBeNull()
    })

    it('should handle validation errors', async () => {
      await expect(
        db.create('profiles', {
          user_id: testUserId,
          username: '', // Invalid: too short
        })
      ).rejects.toThrow()
    })

    it('should handle constraint violations', async () => {
      // Create profile with unique username
      await db.create('profiles', {
        user_id: testUserId,
        username: 'unique',
      })

      // Try to create another profile with same username
      await expect(
        db.create('profiles', {
          user_id: testUserId,
          username: 'unique',
        })
      ).rejects.toThrow()
    })
  })
})
