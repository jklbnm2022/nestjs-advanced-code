import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(`products`)
  async all() {
    return await this.productService.find({});
  }

  @UseGuards(AuthGuard)
  @Post(`admin/products`)
  async create(@Body() body: ProductCreateDto) {
    return await this.productService.save(body);
  }

  @UseGuards(AuthGuard)
  @Get(`admin/products/:id`)
  async get(@Param('id') id: number) {
    return await this.productService.findOne({ where: { id } });
  }

  @UseGuards(AuthGuard)
  @Put(`admin/products/:id`)
  async update(
    @Param('id') id: number,
    @Body() body: Partial<ProductCreateDto>,
  ) {
    await this.productService.update(id, body);
    return await this.productService.findOne({ where: { id } });
  }

  @UseGuards(AuthGuard)
  @Delete(`admin/products/:id`)
  async destroy(@Param('id') id: number) {
    return await this.productService.delete(id);
  }
}
