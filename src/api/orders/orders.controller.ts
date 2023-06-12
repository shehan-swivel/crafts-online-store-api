import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IdParamDto } from 'src/common/dto';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrdersService } from './orders.service';

@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<ApiResponse> {
    const data = await this.ordersService.create(createOrderDto);
    return new ApiResponse(data, 'Order created successfully');
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll(): Promise<ApiResponse> {
    const data = await this.ordersService.findAll();
    return new ApiResponse(data);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  async updateStatus(
    @Param() params: IdParamDto,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<ApiResponse> {
    const data = await this.ordersService.updateStatus(params.id, updateOrderStatusDto);
    return new ApiResponse(data, 'Order status updated successfully');
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param() params: IdParamDto): Promise<ApiResponse> {
    await this.ordersService.delete(params.id);
    return new ApiResponse(null, 'Order deleted successfully');
  }

  @Get(':id')
  async findById(@Param() params: IdParamDto): Promise<ApiResponse> {
    const data = await this.ordersService.findById(params.id);
    return new ApiResponse(data);
  }
}
