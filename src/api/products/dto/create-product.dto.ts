import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ProductCategory } from 'src/constants/enums';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  description: string;

  @IsNotEmpty()
  // @IsNumber()
  qty: number;

  @IsNotEmpty()
  // @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  image: string;
}
