import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { OrderStatus } from 'src/constants/enums';
import { AddressDto } from './address.dto';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  note: string;

  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  phoneNumber: string;

  @ValidateIf((_, value) => !!value)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ValidateNested()
  shippingAddress: AddressDto;
}
