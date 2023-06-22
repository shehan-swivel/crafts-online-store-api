import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from 'src/constants/enums';

export class ProductQuery {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false, enum: ProductCategory })
  category?: ProductCategory;

  @ApiProperty({ required: false })
  orderBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  order?: string;

  @ApiProperty({ required: false })
  limit?: number;
}
