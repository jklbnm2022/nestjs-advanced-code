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
import { DataSource } from 'typeorm';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrderItem } from './entites/order-item.entity';
import { Order } from './entites/order.entity';
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
    private dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const link: Link = await queryRunner.manager.getRepository(Link).findOne({
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

    try {
      const order: Order = await queryRunner.manager
        .getRepository(Order)
        .save(o);
      const AMBASSADOR_REVENUE_RATE = 0.1;

      // throw new Error();

      for (let p of body.products) {
        const product: Product = await queryRunner.manager.findOne(Product, {
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

        await queryRunner.manager.getRepository(OrderItem).save(orderItem);
      }

      await queryRunner.commitTransaction();

      return order;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
