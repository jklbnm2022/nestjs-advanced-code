import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LinkService } from './link.service';

@Controller()
export class LinkController {
  constructor(private linkService: LinkService) {}

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
}
