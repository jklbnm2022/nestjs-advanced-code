import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { LinkController } from './link.controller';
import { Link } from './link.entity';
import { LinkService } from './link.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Link]), AuthModule],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService],
})
export class LinkModule {}
