import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class GlobalCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setCache(key: string, value: string, option?: any): Promise<string> {
    return this.cacheManager.set(key, value, option);
  }

  async getCache(key: string): Promise<string> {
    return this.cacheManager.get(key);
  }

  async deleteCache(key: string): Promise<string> {
    return this.cacheManager.del(key);
  }
}
