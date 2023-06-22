import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from 'src/constants/enums';

export class OrderQuery {
  @ApiProperty({ required: false })
  orderNumber?: string;

  @ApiProperty({ required: false, enum: OrderStatus })
  status?: OrderStatus;

  @ApiProperty({ required: false })
  orderBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  order?: string;
}
