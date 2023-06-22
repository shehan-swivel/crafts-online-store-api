import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { OrderStatus } from 'src/constants/enums';
import { AddressDto } from './address.dto';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ValidateIf((_, value) => !!value)
  @IsNumber()
  amount: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrderItemDto)
  @ApiProperty({ isArray: true, type: OrderItemDto })
  items: OrderItemDto[];

  @IsOptional()
  @ApiProperty({ required: false })
  note?: string;

  @IsNotEmpty()
  @ApiProperty()
  customerName: string;

  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsOptional()
  @ValidateIf((_, value) => !!value)
  @IsEmail()
  @ApiProperty({ required: false })
  email?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty()
  billingAddress: AddressDto;

  @IsOptional()
  @ValidateNested()
  @ApiProperty({ required: false })
  shippingAddress?: AddressDto;
}
