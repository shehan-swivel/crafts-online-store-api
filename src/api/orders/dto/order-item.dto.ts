import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class OrderItemDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  product: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  qty: number;
}
