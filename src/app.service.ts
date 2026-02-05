import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ResponseDTO, dataResponseSuccess } from 'fiscalia_bo-nest-helpers/dist/dto/response.dto';
import { IPackageJson } from 'fiscalia_bo-nest-helpers/dist/dto';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Devuelve información esencial de servicio.
   * @returns
   */
  getPing(): ResponseDTO<{
    author: string;
    dateTimeServer: Date;
    nameApp: string;
    version: string;
  }> {
    const packageJson = this.configService.get<IPackageJson>('packageJson');

    return dataResponseSuccess({
      data: {
        author: packageJson.author,
        dateTimeServer: DateTime.now().toJSDate(),
        nameApp: packageJson?.name,
        version: packageJson?.version,
      },
    });
  }
}
