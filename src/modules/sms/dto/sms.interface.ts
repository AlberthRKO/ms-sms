import { MessageType, MessageStatus } from './message-status.enum';

export interface Messages {
  _id?: string;
  origen?: {
    aplicacion: string;
    modulo: string;
    numero: string;
  };
  destino?: {
    numero: string;
    mensaje: string;
    fichero: boolean;
    tipo: MessageType;
    usuario?: {
      ci: string;
      nombreCompleto: string;
    };
  };
  estado?: MessageStatus;
  entorno?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
