export enum MessageType {
  CODE = 1, // SMS con código
  INFO = 2, // Mensaje informativo
}

export enum MessageStatus {
  PENDING = 0, // Pendiente de envío
  SENT = 1, // Enviado correctamente
  FAILED = 2, // Falló el envío
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
