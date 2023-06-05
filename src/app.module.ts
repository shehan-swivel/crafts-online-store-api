import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './api/admin/admin.module';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './api/products/products.module';
import { SharedModule } from './shared/shared.module';
import { OrdersModule } from './api/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    UsersModule,
    AdminModule,
    ProductsModule,
    SharedModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
