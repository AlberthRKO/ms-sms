import { Body, Controller, Post } from '@nestjs/common';
import { VersionDescription } from 'fiscalia_bo-nest-helpers/dist/decorators/controller.decorator';
import { SomeService } from './some.service';
import { ApiTags } from '@nestjs/swagger';
import { SendCodeDto } from './dto/some.input';
// import { DestineDto } from './dto/mail.input';

@ApiTags('SERVICES')
@Controller('some')
export class SomeController {
  constructor(private readonly appService: SomeService) {}

  @Post('/success')
  @VersionDescription('1', 'documentation of service, return success')
  eventSucces(@Body() inputDto: SendCodeDto) {
    return this.appService.serviceSuccess(inputDto);
  }

  @Post('/error')
  @VersionDescription('1', 'service return error data')
  eventError(@Body() inputDto: SendCodeDto) {
    return this.appService.serviceError(inputDto);
  }
}
