import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @OnEvent(`product_updated`)
  async handleProductUpdatedEvent() {
    await this.cacheManager.del('products_frontend');
    await this.cacheManager.del('products_backend');
  }
}
