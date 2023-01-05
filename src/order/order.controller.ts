import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderService } from './order.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class OrderController {
  constructor(private readonly orderSerivce: OrderService) {}

  @UseGuards(AuthGuard)
  @Get(`admin/orders`)
  async all() {
    return await this.orderSerivce.find({
      relations: {
        order_items: true,
      },
    });
  }
}
