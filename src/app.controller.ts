import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getPing();
  }

  @Get('ping')
  getPing() {
    return this.appService.getPing();
  }

  @Get('health')
  getHealth() {
    return this.appService.getPing();
  }
}
