import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async createRefreshToken(uuid: string, token: string, ttl: number) {
    return this.cacheManager.set(uuid, token, { ttl });
  }

  async getStoredRefreshToken(uuid: string): Promise<string> {
    return this.cacheManager.get(uuid);
  }

  async deleteRefreshToken(uuid: string) {
    return this.cacheManager.del(uuid);
  }
}
