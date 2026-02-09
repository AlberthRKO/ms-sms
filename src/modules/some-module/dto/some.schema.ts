import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/* ------------------------------------------------------------------------------------------------------------------ */

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Message {
  @Prop({ type: String, required: true, index: -1 })
  chatId: string; // ID único para agrupar mensajes del mismo teléfono+app

  @Prop({ type: String })
  mode?: string;

  @Prop({ type: String, index: -1 })
  phone: string;

  @Prop({ type: String })
  message: string;

  @Prop({ type: String, index: -1 })
  app: string;

  @Prop({ type: Object })
  user: Record<string, any>;

  @Prop({ type: Number, required: true, index: -1 })
  messageType: number; // 1: SMS con código, 2: Mensaje informativo

  @Prop({ type: Number, default: 0, index: -1 })
  status: number; // 0: Pendiente, 1: Enviado, 2: Fallido

  // Agregar estas propiedades manualmente para que TypeScript las reconozca
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
