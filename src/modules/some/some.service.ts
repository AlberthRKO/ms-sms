import { Injectable } from '@nestjs/common';
import { SendCodeDto } from './dto/some.input';
import { ConfigService } from '@nestjs/config';
import { dataResponseError, dataResponseSuccess } from 'fiscalia_bo-nest-helpers/dist/dto';

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService) {}

  async serviceSuccess(inputDto: SendCodeDto) {
    const url = `https://fiscalia.gob.bo`;

    return dataResponseSuccess({ data: { ...inputDto, url } });
  }

  async serviceError(inputDto: SendCodeDto) {
    try {
      if (inputDto.application === 'jl2') {
        return dataResponseError('retorna funcion de error programado', { status: 422 });
      }
      throw new Error('ocurrio algo, y coloco sms');
    } catch (error) {
      return dataResponseError(error?.message ?? 'message de error programado', {
        status: 406,
        response: error,
      });
    }
  }
  async serviceError2() {
    return dataResponseError('retorna funcion de error programado', { status: 422 });
  }
}
