import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
