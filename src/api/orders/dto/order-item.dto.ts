import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class OrderItemDto {
  @IsNotEmpty()
  @IsMongoId()
  product: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}
