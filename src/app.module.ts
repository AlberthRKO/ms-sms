import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { configuration } from './config/configuration';
import { APP_PIPE } from '@nestjs/core';
import { DtoValidatorPipe } from './common/pipes/dto-validator.pipe';
import { ParamValidatorPipe } from './common/pipes/param-validator.pipe';
import { GlobalModule } from './modules/global/global.module';
import { AutoTasksModule } from './modules/auto/auto.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MsLogsModule } from 'fiscalia_bo-nest-helpers/dist/modules/ms-logs';
import { SomeModule } from './modules/some-module/some.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRoot(process.env.ENV_MONGO_DB_URL),
    ScheduleModule.forRoot(),
    GlobalModule,
    AutoTasksModule,
    /* ------------------------------------------------------------------------------------------------------------------ */
    SomeModule,
    /* --------------------------------------------------- miservices --------------------------------------------------- */
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
