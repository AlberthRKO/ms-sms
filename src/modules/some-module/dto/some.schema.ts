import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/* ------------------------------------------------------------------------------------------------------------------ */

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Message {
  @Prop({ type: String })
  origin: string;

  @Prop({ type: String, index: -1 })
  destine: string;

  @Prop({ type: String, index: -1 })
  chatID: string;

  // Agregar estas propiedades manualmente para que TypeScript las reconozca
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
