import { Global, Module } from '@nestjs/common';
import { AutoService } from './auto.service';
import { GlobalService } from '../global/global.service';

/**
 * Módulo global para gestión de tareas automáticas y programadas
 * @Global() hace que este módulo esté disponible en toda la aplicación sin necesidad de importarlo
 */
@Global()
@Module({
  imports: [],
  providers: [AutoService, GlobalService],
  exports: [AutoService],
})
export class AutoTasksModule {}
