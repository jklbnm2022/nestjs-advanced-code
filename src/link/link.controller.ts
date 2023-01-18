import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Order } from 'src/order/entites/order.entity';
import { Link } from './link.entity';
import { LinkService } from './link.service';

@UseInterceptors(ClassSerializerInterceptor)
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

  @UseGuards(AuthGuard)
  @Get(`ambassador/stats`)
  async stats(@Req() req: Request) {
    const user = await this.authService.user(req);

    const links: Link[] = await this.linkService.find({
      where: { user },
      relations: {
        orders: true,
      },
    });

    return links.map((link) => {
      const completedOrders: Order[] = link.orders.filter((o) => o.complete);
      return {
        code: link.code,
        count: completedOrders.length,
        revenue: completedOrders.reduce((s, o) => s + o.ambassador_revenue, 0),
      };
    });
  }

  @Get(`checkout/links/:code`)
  async link(@Param('code') code: string) {
    return await this.linkService.findOne({
      where: {
        code,
      },
      relations: {
        user: true,
        products: true,
      },
    });
  }
}
