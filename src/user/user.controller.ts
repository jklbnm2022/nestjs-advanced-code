import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './user.entity';
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(`admin/ambassadors`)
  ambassadors() {
    return this.userService.find({ where: { is_ambassador: true } });
  }

  @Get(`ambassador/rankings`)
  async rankings() {
    const ambassador: User[] = await this.userService.find({
      where: {
        is_ambassador: true,
      },
      relations: ['orders', 'orders.order_items'],
    });

    return ambassador.map((a) => {
      return {
        name: a.name,
        revenue: a.revenue,
      };
    });
  }
}
