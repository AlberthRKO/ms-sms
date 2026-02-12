export enum MessageType {
  CODE = 'Codigo', // SMS con código
  INFO = 'Informativo', // Mensaje informativo
}

export enum MessageStatus {
  PENDING = 'Pendiente', // Pendiente de envío
  SENT = 'Enviado', // Enviado correctamente
  FAILED = 'Fallido', // Falló el envío
}

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  [MessageType.CODE]: 'SMS con código',
  [MessageType.INFO]: 'Mensaje informativo',
};

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  [MessageStatus.PENDING]: 'Pendiente',
  [MessageStatus.SENT]: 'Enviado',
  [MessageStatus.FAILED]: 'Fallido',
};
