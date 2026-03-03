import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Entorno, MessageStatus, MessageType } from './message-status.enum';

/* ------------------------------------------------------------------------------------------------------------------ */

export type MessageDocument = HydratedDocument<Message>;

// Subdocumento para información de origen
@Schema({ _id: false })
export class Origen {
  @Prop({ type: String, required: true })
  aplicacion: string; // Aplicación de origen (ej: "JL-Penal", "ms-auth")

  @Prop({ type: String, required: true })
  modulo: string; // Módulo de origen (ej: "Login", "Registro")

  @Prop({ type: String, required: true })
  numero: string; // Número de origen desde donde se envía
}

// Subdocumento para información de destino
@Schema({ _id: false })
export class Destino {
  @Prop({ type: String, required: true, index: -1 })
  numero: string; // Número destino que recibirá el SMS

  @Prop({ type: String, required: true })
  mensaje: string; // Contenido del mensaje

  @Prop({ type: Boolean, default: false })
  fichero: boolean; // Indica si incluye fichero adjunto

  @Prop({ type: String, required: true, enum: MessageType, index: -1, default: MessageType.CODE })
  tipo: string; // Tipo: "Codigo" o "Informativo"

  @Prop({ type: Object, required: false })
  usuario?: {
    ci: string;
    nombreCompleto: string;
  };
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Message {
  @Prop({ type: Origen, required: true })
  origen: Origen;

  @Prop({ type: Destino, required: true })
  destino: Destino;

  @Prop({
    type: String,
    default: MessageStatus.PENDING,
    enum: MessageStatus,
    index: -1,
  })
  estado: string; // Estado: "Pendiente", "Enviado" o "Fallido"

  @Prop({ type: String, required: true, enum: Entorno, index: -1, default: Entorno.DEV })
  entorno: string;

  // Agregar estas propiedades manualmente para que TypeScript las reconozca
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
