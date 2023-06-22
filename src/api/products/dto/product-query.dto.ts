import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from 'src/constants/enums';

export class ProductQuery {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  category?: ProductCategory;

  @ApiProperty()
  orderBy?: string;

  @ApiProperty()
  order?: string;

  @ApiProperty()
  limit?: number;
}
