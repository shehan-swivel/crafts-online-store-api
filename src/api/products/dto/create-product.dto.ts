import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ProductCategory } from 'src/constants/enums';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsNotEmpty()
  @ApiProperty()
  qty: number;

  @IsNotEmpty()
  @ApiProperty()
  price: number;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  @ApiProperty()
  category: ProductCategory;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: any;
}
