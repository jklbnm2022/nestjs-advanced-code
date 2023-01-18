import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Link } from 'src/link/link.entity';
import { LinkService } from 'src/link/link.service';
import { Product } from 'src/product/product.entity';
import { ProductService } from 'src/product/product.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderItemService } from './order-item.service';
import { OrderService } from './order.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class OrderController {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderSerivce: OrderService,
    private readonly linkService: LinkService,
    private readonly productService: ProductService,
  ) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(`admin/orders`)
  async all() {
    return await this.orderSerivce.find({
      relations: {
        order_items: true,
      },
    });
  }

  @Post(`checkout/orders`)
  async create(@Body() body: CreateOrderDto) {
    const link: Link = await this.linkService.findOne({
      where: {
        code: body.code,
      },
      relations: {
        user: true,
      },
    });

    if (!link) {
      throw new BadRequestException(`Invalid link.`);
    }

    const o = {
      user_id: link.user.id,
      ambassador_email: link.user.email,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      address: body.address,
      country: body.country,
      city: body.city,
      zip: body.zip,
      code: body.code,
    };

    const order = await this.orderSerivce.save(o);
    const AMBASSADOR_REVENUE_RATE = 0.1;

    for (let p of body.products) {
      const product: Product = await this.productService.findOne({
        where: {
          id: p.product_id,
        },
      });

      const orderItem = {
        order: order,
        product_title: product.title,
        price: product.price,
        quantity: p.quantity,
        ambassador_revenue:
          AMBASSADOR_REVENUE_RATE * product.price * p.quantity,
        admin_revenue:
          (1 - AMBASSADOR_REVENUE_RATE) * product.price * p.quantity,
      };

      await this.orderItemService.save(orderItem);
    }

    return order;
  }
}
