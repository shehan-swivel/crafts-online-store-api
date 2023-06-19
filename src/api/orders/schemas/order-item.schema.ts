import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/api/products/schemas/product.schema';

export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  qty: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
