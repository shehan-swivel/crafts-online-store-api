import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LastOrderNumberDocument = HydratedDocument<LastOrderNumber>;

@Schema()
export class LastOrderNumber {
  @Prop({ required: true, default: 0 })
  number: number;
}

export const LastOrderNumberSchema = SchemaFactory.createForClass(LastOrderNumber);
