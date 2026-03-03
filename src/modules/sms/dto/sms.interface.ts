import { MessageType, MessageStatus } from './message-status.enum';

export interface Messages {
  _id?: string;
  origen?: {
    aplicacion: string;
    modulo: string;
    numero: string;
    usuario: {
      ci: string;
      nombreCompleto: string;
    };
  };
  destino?: {
    numero: string;
    mensaje: string;
    fichero: boolean;
    tipo: MessageType;
  };
  estado?: MessageStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
