import { Controller, Post, Body } from '@nestjs/common';
import { SomeService } from './some.service';
import { SendMessageTextDTO } from './dto/some.input.dto';
import { ApiTags } from '@nestjs/swagger';
import { VersionDescription } from 'fiscalia_bo-nest-helpers/dist/decorators/controller.decorator';
import { ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto/response.dto';
import { Messages } from './dto/some.interface';

@ApiTags('SOME SERVICES')
@Controller('some')
export class SomeController {
  constructor(private readonly someService: SomeService) {}

  @Post('send-message')
  @VersionDescription('1', 'enviar mensajes por some service')
  async sendMessage(@Body() InputDto: SendMessageTextDTO): Promise<ResponseDTO<Messages>> {
    return this.someService.sendMessageByPhone(InputDto);
  }
}
