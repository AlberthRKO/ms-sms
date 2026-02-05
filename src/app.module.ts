import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './common/config/configuration';
import { ParamValidatorPipe } from './common/pipes/param-validator.pipe';
import { DtoValidatorPipe } from './common/pipes/dto-validator.pipe';
import { SomeModule } from './modules/some/some.module';
import { MsLogsModule } from 'fiscalia_bo-nest-helpers/dist/modules/ms-logs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], expandVariables: true }),
    SomeModule,
    // DatabaseModule,
    MsLogsModule.register({
      global: true,
      urlMsLogs: process.env.ENV_SERVICE_MS_LOGS ?? null,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: DtoValidatorPipe },
    { provide: APP_PIPE, useClass: ParamValidatorPipe },
  ],
})
export class AppModule {}
