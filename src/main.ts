import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IPackageJson } from './config/configuration';
import { configSwagger, printServerInitLog } from './helpers/swagger.helper';
import * as multipart from '@fastify/multipart';
import * as fastifyStatic from '@fastify/static';
import { VersioningType } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 1048576 * 100 }),
  );

  // Registrar el plugin multipart
  await app.register(multipart as any, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 1,
    },
  });

  // Servir archivos estáticos desde la carpeta public
  await app.register(fastifyStatic as any, {
    root: join(process.cwd(), 'public'),
    prefix: '/public/',
  });

  app.enableShutdownHooks();
  app.enableVersioning({ type: VersioningType.URI });

  const configService = app.get(ConfigService);
  const packageJson = configService.get<IPackageJson>('packageJson');

  if (configService.get<boolean>('showSwagger'))
    configSwagger(app, packageJson, { jsonDocumentUrl: '/api/swagger.yml' });

  // Interceptors globales
  app.useGlobalInterceptors(new ResponseFormatInterceptor(app.get(Reflector)));

  // Filters globales
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = configService.get<number>('port') || 3515;
  const host = configService.get('host');
  await app.listen(port, host).then(async () => {
    printServerInitLog(app, packageJson);
  });
}
void bootstrap();
