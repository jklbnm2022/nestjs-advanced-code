import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { LinkService } from './link.service';

@Controller()
export class LinkController {
  constructor(
    private linkService: LinkService,
    private authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get(`admin/users/:id/links`)
  async all(@Param('id') user_id: number) {
    return await this.linkService.find({
      where: {
        user: { id: user_id },
      },
      relations: {
        orders: true,
      },
    });
  }

  @UseGuards(AuthGuard)
  @Post('ambassador/links')
  async create(@Body('products') products: number[], @Req() request: Request) {
    const user = await this.authService.user(request);

    return await this.linkService.save({
      code: Math.random().toString(36).substring(6),
      user,
      products: products.map((id) => ({ id })),
    });
  }
}
