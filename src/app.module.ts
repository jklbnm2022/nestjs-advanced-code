import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { LinkModule } from './link/link.module';
import { SharedModule } from './shared/shared.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configOption from './config/config.options';

@Module({
  imports: [
    ConfigModule.forRoot(configOption),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get<'mysql' | 'mariadb'>('database.type'),
          host: configService.get('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          autoLoadEntities: configService.get<boolean>(
            'database.autoLoadEntities',
          ),
          synchronize: configService.get<boolean>('database.synchronize'),
          logging: configService.get('database.logging'),
          charset: configService.get('database.charset'),
        };
      },
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ProductModule,
    OrderModule,
    LinkModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
