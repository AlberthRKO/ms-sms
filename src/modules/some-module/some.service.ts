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
import { MessageStatus } from './dto/message-status.enum';
import { SomeGateway } from './some.gateway';

@Injectable()
export class SomeService {
  private readonly logger = new Logger(SomeService.name);

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly configService: ConfigService,
    private readonly someGateway: SomeGateway,
  ) {}

  /**
   * Crea un mensaje SMS y emite evento WebSocket para que la app externa lo envíe
   * SOLO emite el evento 'send-message', NO emite 'send-message-status'
   * @param inputDto Datos del mensaje a enviar
   * @returns Datos del mensaje creado
   */
  async sendMessageByPhone(inputDto: SendMessageTextDTO): Promise<ResponseDTO<any>> {
    const { origen, destino } = inputDto;

    // Crear el mensaje con estado inicial PENDIENTE
    const createdMessage = await this.messageModel.create({
      origen: {
        aplicacion: origen.aplicacion,
        modulo: origen.modulo,
        numero: origen.numero,
        usuario: {
          ci: origen.usuario.ci,
          nombreCompleto: origen.usuario.nombreCompleto,
        },
      },
      destino: {
        numero: destino.numero,
        mensaje: destino.mensaje,
        fichero: destino.fichero || false,
        tipo: destino.tipo,
      },
      estado: MessageStatus.PENDING, // Siempre inicia como "Pendiente"
    });

    const payload = {
      _id: createdMessage._id.toString(),
      origen: createdMessage.origen,
      destino: {
        ...createdMessage.destino,
        tipo: createdMessage.destino.tipo as any,
      },
      estado: createdMessage.estado as any,
      createdAt: createdMessage.createdAt,
      updatedAt: createdMessage.updatedAt,
    };

    // SOLO emitir evento de nuevo mensaje, NO emitir evento de estado
    this.someGateway.emitSendMessage(payload);

    this.logger.log(
      `Mensaje creado - ID: ${payload._id}, Tipo: ${destino.tipo}, App: ${origen.aplicacion}, Destino: ${destino.numero}`,
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
      { estado: inputDto.estado },
      { new: true },
    );

    if (!updatedMessage) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    const payload = {
      _id: updatedMessage._id.toString(),
      origen: updatedMessage.origen,
      destino: {
        ...updatedMessage.destino,
        tipo: updatedMessage.destino.tipo as any,
      },
      estado: updatedMessage.estado as any,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
    };

    // Emitir evento de actualización de estado
    this.someGateway.emitStatusUpdate(payload);

    this.logger.log(
      `Estado actualizado - ID: ${payload._id}, Estado: ${inputDto.estado}, App: ${updatedMessage.origen.aplicacion}`,
    );

    return dataResponseSuccess({ data: payload }, { message: 'Estado actualizado exitosamente' });
  }

  /**
   * Escapa caracteres especiales de regex
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Lista los mensajes guardados con filtros opcionales
   * @param queryDto Filtros de búsqueda y paginación
   * @returns Lista de mensajes con paginación
   */
  async listMessages(queryDto: ListMessagesQueryDTO): Promise<ResponseDTO<any>> {
    const { tipo, estado, numero, aplicacion, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinámicamente
    const filter: any = {};
    if (tipo !== undefined) filter['destino.tipo'] = tipo;
    if (estado !== undefined) filter.estado = estado;
    if (numero) filter['destino.numero'] = { $regex: this.escapeRegex(numero), $options: 'i' };
    if (aplicacion) filter['origen.aplicacion'] = { $regex: this.escapeRegex(aplicacion), $options: 'i' };

    const skip = (page - 1) * limit;

    // Obtener mensajes y total de registros
    const [messages, total] = await Promise.all([
      this.messageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.messageModel.countDocuments(filter),
    ]);

    const formattedMessages = messages
      .filter((msg: any) => msg.origen && msg.destino) // Filtrar solo mensajes con estructura válida
      .map((msg: any) => ({
        _id: msg._id.toString(),
        origen: msg.origen,
        destino: {
          ...msg.destino,
          tipo: msg.destino.tipo as any,
        },
        estado: msg.estado as any,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

    return dataResponseSuccess(
      {
        data: formattedMessages,
        pagination: {
          total: formattedMessages.length, // Usar longitud de mensajes filtrados
          page,
          size: limit,
        },
      },
      { message: 'Mensajes obtenidos exitosamente' },
    );
  }
}
