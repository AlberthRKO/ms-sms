import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SomeService } from './some.service';
import {
  SendMessageTextDTO,
  UpdateMessageStatusDTO,
  ListMessagesQueryDTO,
} from './dto/some.input.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { VersionDescription } from 'fiscalia_bo-nest-helpers/dist/decorators/controller.decorator';
import { ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto/response.dto';
import { Messages } from './dto/some.interface';

@ApiTags('SMS SERVICES')
@Controller('sms')
export class SomeController {
  constructor(private readonly someService: SomeService) {}

  @Post('send-message')
  @VersionDescription('1', 'Crear y enviar mensaje SMS')
  @ApiOperation({
    summary: 'Enviar mensaje SMS',
    description:
      'Crea un mensaje SMS (tipo 1: código, tipo 2: informativo) y emite evento WebSocket "send-message". NO emite evento de estado automáticamente.',
  })
  async sendMessage(@Body() InputDto: SendMessageTextDTO): Promise<ResponseDTO<Messages>> {
    return this.someService.sendMessageByPhone(InputDto);
  }

  @Post('send-message/status')
  @VersionDescription('1', 'Actualizar estado de mensaje enviado')
  @ApiOperation({
    summary: 'Actualizar estado del mensaje',
    description:
      'La app externa llama este endpoint después de enviar el SMS para actualizar el estado (0: pendiente, 1: enviado, 2: fallido). SOLO aquí se emite "send-message-status".',
  })
  async updateMessageStatus(
    @Body() inputDto: UpdateMessageStatusDTO,
  ): Promise<ResponseDTO<Messages>> {
    return this.someService.updateMessageStatus(inputDto);
  }

  @Get('messages')
  @VersionDescription('1', 'Listar mensajes guardados')
  @ApiOperation({
    summary: 'Listar mensajes',
    description:
      'Obtiene la lista de mensajes guardados con filtros opcionales (tipo, estado, teléfono, app) y paginación',
  })
  async listMessages(@Query() queryDto: ListMessagesQueryDTO): Promise<ResponseDTO<any>> {
    return this.someService.listMessages(queryDto);
  }

  @Get('messages/chat/:chatId')
  @VersionDescription('1', 'Obtener mensajes de un chat específico')
  @ApiOperation({
    summary: 'Mensajes por chatId',
    description:
      'Obtiene todos los mensajes agrupados por chatId (teléfono+app). Útil para ver historial de conversaciones.',
  })
  @ApiParam({
    name: 'chatId',
    description: 'ID del chat (generado automáticamente por teléfono+app)',
    example: 'a1b2c3d4e5f6g7h8',
  })
  async getMessagesByChatId(
    @Param('chatId') chatId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDTO<any>> {
    return this.someService.getMessagesByChatId(chatId, page, limit);
  }
}
