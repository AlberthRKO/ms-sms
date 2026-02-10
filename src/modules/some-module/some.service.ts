import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Message, MessageDocument } from './dto/some.schema';
import { dataResponseSuccess, ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto';
import {
  SendMessageTextDTO,
  UpdateMessageStatusDTO,
  ListMessagesQueryDTO,
} from './dto/some.input.dto';
import { MessageStatus, MessageType } from './dto/message-status.enum';
import { SomeGateway } from './some.gateway';
import { createHash } from 'crypto';

@Injectable()
export class SomeService {
  private readonly logger = new Logger(SomeService.name);

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly configService: ConfigService,
    private readonly someGateway: SomeGateway,
  ) {}

  /**
   * Genera un chatId único basado en el teléfono y la aplicación
   * Esto permite agrupar todos los mensajes del mismo usuario en la misma app
   */
  private generateChatId(phone: string, app: string): string {
    // Normalizar el teléfono (quitar caracteres especiales)
    const normalizedPhone = phone.replace(/[^0-9]/g, '');
    const normalizedApp = app.toLowerCase().trim();

    // Generar hash MD5 para un ID consistente
    const hash = createHash('md5').update(`${normalizedPhone}-${normalizedApp}`).digest('hex');

    return hash.substring(0, 16); // Usar solo los primeros 16 caracteres
  }

  /**
   * Crea un mensaje SMS y emite evento WebSocket para que la app externa lo envíe
   * SOLO emite el evento 'send-message', NO emite 'send-message-status'
   * @param inputDto Datos del mensaje a enviar
   * @returns Datos del mensaje creado
   */
  async sendMessageByPhone(inputDto: SendMessageTextDTO): Promise<ResponseDTO<any>> {
    const { message, app, user, phone, mode, messageType } = inputDto;

    // Generar chatId para agrupar mensajes
    const chatId = this.generateChatId(phone, app);

    // Crear el mensaje con estado inicial PENDING
    const createdMessage = await this.messageModel.create({
      chatId,
      message,
      app,
      user,
      phone,
      mode,
      messageType,
      status: MessageStatus.PENDING, // Siempre inicia como pendiente
    });

    const payload = {
      messageId: createdMessage._id.toString(),
      chatId: createdMessage.chatId,
      message: createdMessage.message,
      app: createdMessage.app,
      user: createdMessage.user,
      phone: createdMessage.phone,
      mode: createdMessage.mode,
      messageType: createdMessage.messageType,
      status: createdMessage.status,
      createdAt: createdMessage.createdAt,
      updatedAt: createdMessage.updatedAt,
    };

    // SOLO emitir evento de nuevo mensaje, NO emitir evento de estado
    this.someGateway.emitSendMessage(payload);

    this.logger.log(
      `Mensaje creado - ChatID: ${chatId}, ID: ${payload.messageId}, Tipo: ${messageType === MessageType.CODE ? 'CÓDIGO' : 'INFORMATIVO'}, Tel: ${phone}`,
    );

    return dataResponseSuccess({ data: payload }, { message: 'Mensaje creado exitosamente' });
  }

  /**
   * Actualiza el estado de un mensaje
   * La app externa llama este endpoint después de enviar el SMS
   * ESTE es el ÚNICO lugar donde se emite 'send-message-status'
   * @param inputDto ID del mensaje y nuevo estado
   * @returns Datos del mensaje actualizado
   */
  async updateMessageStatus(inputDto: UpdateMessageStatusDTO): Promise<ResponseDTO<any>> {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      inputDto.messageId,
      { status: inputDto.status },
      { new: true },
    );

    if (!updatedMessage) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    const payload = {
      messageId: updatedMessage._id.toString(),
      chatId: updatedMessage.chatId,
      message: updatedMessage.message,
      app: updatedMessage.app,
      user: updatedMessage.user,
      phone: updatedMessage.phone,
      mode: updatedMessage.mode,
      messageType: updatedMessage.messageType,
      status: updatedMessage.status,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
    };

    // Emitir evento de actualización de estado
    this.someGateway.emitStatusUpdate(payload);

    const statusLabel = inputDto.status === MessageStatus.SENT ? 'ENVIADO' : 'FALLIDO';
    this.logger.log(
      `Estado actualizado - ChatID: ${payload.chatId}, ID: ${payload.messageId}, Estado: ${statusLabel}`,
    );

    return dataResponseSuccess({ data: payload }, { message: 'Estado actualizado exitosamente' });
  }

  /**
   * Lista los mensajes guardados con filtros opcionales
   * Soporta filtrado por chatId para ver conversaciones agrupadas
   * @param queryDto Filtros de búsqueda y paginación
   * @returns Lista de mensajes con paginación
   */
  async listMessages(queryDto: ListMessagesQueryDTO): Promise<ResponseDTO<any>> {
    const { messageType, status, phone, app, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinámicamente
    const filter: any = {};
    if (messageType !== undefined) filter.messageType = messageType;
    if (status !== undefined) filter.status = status;
    if (phone) filter.phone = { $regex: phone, $options: 'i' };
    if (app) filter.app = { $regex: app, $options: 'i' };

    const skip = (page - 1) * limit;

    // Obtener mensajes y total de registros
    const [messages, total] = await Promise.all([
      this.messageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.messageModel.countDocuments(filter),
    ]);

    const formattedMessages = messages.map((msg: any) => ({
      messageId: msg._id.toString(),
      chatId: msg.chatId,
      message: msg.message,
      app: msg.app,
      user: msg.user,
      phone: msg.phone,
      mode: msg.mode,
      messageType: msg.messageType,
      status: msg.status,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    return dataResponseSuccess(
      {
        data: formattedMessages,
        pagination: {
          total,
          page,
          size: limit,
        },
      },
      { message: 'Mensajes obtenidos exitosamente' },
    );
  }

  /**
   * Obtiene todos los mensajes de un chat específico (agrupados por chatId)
   * Útil para ver el historial de mensajes de un teléfono+app
   */
  async getMessagesByChatId(chatId: string, page = 1, limit = 50): Promise<ResponseDTO<any>> {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.messageModel.countDocuments({ chatId }),
    ]);

    const formattedMessages = messages.map((msg: any) => ({
      messageId: msg._id.toString(),
      chatId: msg.chatId,
      message: msg.message,
      app: msg.app,
      user: msg.user,
      phone: msg.phone,
      mode: msg.mode,
      messageType: msg.messageType,
      status: msg.status,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    return dataResponseSuccess(
      {
        data: formattedMessages,
        pagination: {
          total,
          page,
          size: limit,
        },
      },
      { message: 'Mensajes del chat obtenidos exitosamente' },
    );
  }
}
