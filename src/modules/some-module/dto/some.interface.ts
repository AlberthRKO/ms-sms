import { MessageType, MessageStatus } from './message-status.enum';

export interface Messages {
  messageId: string;
  chatId: string;
  mode?: string;
  phone: string;
  message: string;
  app: string;
  user: object;
  messageType: MessageType;
  status: MessageStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
