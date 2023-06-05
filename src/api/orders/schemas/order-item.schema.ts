import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  product: string;

  @Prop({ required: true })
  qty: number;
}

export const AddressSchema = SchemaFactory.createForClass(OrderItem);
