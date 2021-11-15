import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { redisConstants } from 'src/config/redis.config';
import { GlobalCacheService } from './global.cache.service';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConstants.url,
      port: 6379,
    }),
  ],
  providers: [GlobalCacheService],
  exports: [GlobalCacheService],
})
export class GlobalCacheModule {}
