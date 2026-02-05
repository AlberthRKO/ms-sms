import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { ResponseDTO } from 'fiscalia_bo-nest-helpers/dist/dto/response.dto';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Devuelve información esencial de servicio.
   * @returns
   */
  getPing(): ResponseDTO<{
    author: string;
    dateTimeServer: string;
    nameApp: string;
    version: string;
  }> {
    const packageJson = this.configService.get<any>('packageJson');
    return {
      error: false,
      message: packageJson?.description,
      response: {
        data: {
          author: packageJson.author,
          dateTimeServer: dayjs().toISOString(),
          nameApp: packageJson?.name,
          version: packageJson?.version,
        },
      },
      status: 200,
    };
  }
}
