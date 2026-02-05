import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlobalService {
  private readonly printLog: boolean;

  constructor(private readonly configService: ConfigService) {
    this.printLog = this.configService.get<boolean>('showDebugServer');
  }

  printTerminalLog(message: string, serviceName = 'GlobalService', mode = 'log'): void {
    if (this.printLog) {
      if (mode === 'warn') Logger.warn(message, serviceName);
      if (mode === 'error') Logger.error(message, serviceName);
      if (mode === 'log') Logger.log(message, serviceName);
      if (mode === 'debug') Logger.debug(message, serviceName);
    }
  }
}
