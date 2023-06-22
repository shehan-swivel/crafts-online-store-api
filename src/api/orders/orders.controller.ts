import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { IdParamDto } from 'src/common/dto';
import { ApiResponse } from 'src/common/responses';
import { AccessTokenGuard } from '../auth/guards';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOkResponse({ description: 'Order created successfully.' })
  @ApiUnprocessableEntityResponse({ description: 'One or more items in the order are invalid or unavailable.' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<ApiResponse> {
    const data = await this.ordersService.create(createOrderDto);
    return new ApiResponse(data, 'Your order has been placed successfully. Thank you for choosing our service');
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Orders fetched successfully.' })
  async findAll(): Promise<ApiResponse> {
    const data = await this.ordersService.findAll();
    return new ApiResponse(data);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Order status updated successfully.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async updateStatus(
    @Param() params: IdParamDto,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<ApiResponse> {
    const data = await this.ordersService.updateStatus(params.id, updateOrderStatusDto);
    return new ApiResponse(data, 'Order status updated successfully');
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Order deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async delete(@Param() params: IdParamDto): Promise<ApiResponse> {
    await this.ordersService.delete(params.id);
    return new ApiResponse(null, 'Order deleted successfully');
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Order fetched successfully.' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async findById(@Param() params: IdParamDto): Promise<ApiResponse> {
    const data = await this.ordersService.findById(params.id);
    return new ApiResponse(data);
  }
}
