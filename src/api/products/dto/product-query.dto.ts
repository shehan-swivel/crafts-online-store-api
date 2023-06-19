import { ProductCategory } from 'src/constants/enums';

export class ProductQuery {
  name?: string;
  category?: ProductCategory;
  limit?: number;
}
