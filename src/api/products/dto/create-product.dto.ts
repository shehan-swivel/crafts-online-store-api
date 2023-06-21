import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductCategory } from 'src/constants/enums';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  description: string;

  @IsNotEmpty()
  qty: number;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  image: any;
}
