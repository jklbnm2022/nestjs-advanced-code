import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as rs from 'redis';

@Module({
  imports: [
    JwtModule.register({
      secret: 'bad_hard_coding_in_module.',
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register({
      store: rs.redisStore,
      host: 'localhost',
      port: 6379,
      legacyMode: true,
    }),
  ],
  exports: [JwtModule, CacheModule],
})
export class SharedModule {}
