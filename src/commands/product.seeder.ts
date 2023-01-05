import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { faker } from '@faker-js/faker';
import { ProductService } from 'src/product/product.service';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  for (let i = 0; i < 30; i++) {
    await productService.save({
      title: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      image: faker.image.imageUrl(200, 200, '', true),
      price: faker.commerce.price(10, 100),
    });
  }

  process.exit();
})();
