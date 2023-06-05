import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/api/products/schemas/product.schema';
import { OrderStatus } from 'src/constants/enums';
import { Address } from './address.schema';
import { OrderItem } from './order-item.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Order {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: OrderStatus;

  @Prop({ required: true, type: Types.ObjectId, ref: Product.name })
  items: OrderItem[];

  @Prop()
  note: string;

  /**
   * Customer data also will be saved in the order object since this application is not handling customer accounts.
   * If the requirement is to handle customer accounts also, it's better to move below properties into Customer schema
   */
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  billingAddress: Address;

  @Prop()
  shippingAddress: Address;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
