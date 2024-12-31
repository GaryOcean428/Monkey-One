import { supabase } from '../supabase/config';
import { getRedisClient } from '../redis/config';

export class StorageService {
  private static instance: StorageService;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob | Buffer,
    options: {
      contentType?: string;
      cacheControl?: string;
      upsert?: boolean;
    } = {}
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options.contentType,
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false,
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async downloadFile(
    bucket: string,
    path: string,
    useCache = true
  ): Promise<Blob> {
    if (useCache) {
      const redis = await getRedisClient();
      const cacheKey = `file:${bucket}:${path}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return new Blob([Buffer.from(cached, 'base64')]);
      }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    if (data && useCache) {
      const redis = await getRedisClient();
      const cacheKey = `file:${bucket}:${path}`;
      const buffer = await data.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      await redis.set(cacheKey, base64, {
        EX: this.CACHE_TTL,
      });
    }

    return data;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    // Invalidate cache
    const redis = await getRedisClient();
    await redis.del(`file:${bucket}:${path}`);
  }

  async listFiles(
    bucket: string,
    path?: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
      searchText?: string;
    } = {}
  ) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: options.limit,
        offset: options.offset,
        sortBy: options.sortBy,
        search: options.searchText,
      });

    if (error) throw error;
    return data;
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  }

  // Cache management
  async invalidateCache(pattern: string): Promise<void> {
    const redis = await getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}

export const storage = StorageService.getInstance();
