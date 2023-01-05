import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { LinkController } from './link.controller';
import { Link } from './link.entity';
import { LinkService } from './link.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([Link])],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
