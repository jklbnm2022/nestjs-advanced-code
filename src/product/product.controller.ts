import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

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

  @CacheKey('products_frontend')
  @CacheTTL(30 * 60)
  @UseInterceptors(CacheInterceptor)
  @Get(`ambassador/products/frontend`)
  async frontend() {
    return this.productService.find();
  }

  @Get(`ambassador/products/backend`)
  async backend() {
    let products = await this.cacheManager.get(`products_backend`);

    if (!products) {
      products = await this.productService.find({});

      await this.cacheManager.set(`products_backend`, products, 1800);
    }

    return products;
  }
}
