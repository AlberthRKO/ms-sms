import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { configSwagger, printServerInitLog } from 'fiscalia_bo-nest-helpers/dist/helpers';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { IPackageJson } from 'fiscalia_bo-nest-helpers/dist/dto';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/interceptors/global-exception.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 1048576 * 100 }),
  );

  const configService = app.get(ConfigService);
  const packageJson = configService.get<IPackageJson>('packageJson');
  const corsOptions = configService.get<string>('cors');

  // middleware for static files
  app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'),
    prefix: '/assets/',
  });

  app.register(fastifyCors, {
    origin: corsOptions, // origin allowed: ValueOrArray<OriginType>
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', ''], // methods allowed
    // allowedHeaders: ['Content-Type', 'Authorization'], // headers allowed
  });

  app.enableVersioning({ type: VersioningType.URI });

  if (configService.get('showSwagger') === 'true')
    configSwagger(app, packageJson, { jsonDocumentUrl: '/api/swagger.yml' });

  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  const port = configService.get<number>('port') || 3020;
  const host = configService.get('host') || '0.0.0.0';

  await app.listen(port, host).then(async () => {
    printServerInitLog(app, packageJson);
  });
}
bootstrap();
