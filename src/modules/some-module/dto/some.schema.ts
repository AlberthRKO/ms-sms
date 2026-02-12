import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({ type: Object, required: true })
  usuario: {
    ci: string;
    nombreCompleto: string;
  };
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

  @Prop({ type: String, required: true, enum: ['Codigo', 'Informativo'], index: -1 })
  tipo: string; // Tipo: "Codigo" o "Informativo"
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Message {
  @Prop({ type: Origen, required: true })
  origen: Origen;

  @Prop({ type: Destino, required: true })
  destino: Destino;

  @Prop({ type: String, default: 'Pendiente', enum: ['Pendiente', 'Enviado', 'Fallido'], index: -1 })
  estado: string; // Estado: "Pendiente", "Enviado" o "Fallido"

  // Agregar estas propiedades manualmente para que TypeScript las reconozca
  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
