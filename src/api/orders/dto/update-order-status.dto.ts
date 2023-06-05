import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'src/constants/enums';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
