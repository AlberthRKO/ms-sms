import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Messages } from './dto/some.interface';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class SomeGateway {
  private readonly logger = new Logger(SomeGateway.name);

  @WebSocketServer()
  server: Server;

  /**
   * Emite el evento cuando se crea un nuevo mensaje
   * La app externa escucha este evento para enviar el SMS
   */
  emitSendMessage(payload: Messages) {
    this.logger.log(
      `Emitiendo evento 'send-message' - Tipo: ${payload.destino?.tipo || 'N/A'}, App: ${payload.origen?.aplicacion || 'N/A'}, Destino: ${payload.destino?.numero || 'N/A'}`,
    );
    this.server.emit('send-message', payload);
  }

  /**
   * Emite el evento cuando se actualiza el estado de un mensaje
   */
  emitStatusUpdate(payload: Messages) {
    this.logger.log(
      `Emitiendo evento 'send-message-status' - ID: ${payload._id || 'N/A'}, Estado: ${payload.estado || 'N/A'}`,
    );
    this.server.emit('send-message-status', payload);
  }
}
