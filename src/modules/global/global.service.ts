import { Injectable } from '@nestjs/common';
import { MsLogsService } from 'fiscalia_bo-nest-helpers/dist/modules/ms-logs';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalService {
  private readonly appTagName: string;

  constructor(
    public readonly msLogsService: MsLogsService,
    private readonly configService: ConfigService,
  ) {
    this.appTagName = this.configService.get('appTagName');
  }
}
