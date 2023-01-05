import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    JwtModule.register({
      secret: 'bad_hard_coding_in_module.',
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  exports: [JwtModule],
})
export class SharedModule {}
