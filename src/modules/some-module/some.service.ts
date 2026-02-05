import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Message, MessageDocument } from './dto/some.schema';
import { dataResponseSuccess, ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto';
import { SendMessageTextDTO } from './dto/some.input.dto';

@Injectable()
export class SomeService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly configService: ConfigService,
  ) {}

  async sendMessageByPhone(inputDto: SendMessageTextDTO): Promise<ResponseDTO<any>> {
    const { message, app, user, phone, mode } = inputDto;
    return dataResponseSuccess(
      { data: { message, app, user, phone, mode } },
      { message: 'Mensaje guardado con exito' },
    );
  }
}
