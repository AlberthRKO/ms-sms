import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio global para gestión de tareas automáticas y programadas
 * Todas las tareas CRON del sistema deben estar centralizadas aquí
 */
@Injectable()
export class AutoService {
  private readonly logger = new Logger(AutoService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Tarea programada: Limpieza automática de bloques huérfanos
   * Ejecuta todos los días a las 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async tareaLimpiezaAutomatica(): Promise<void> {
    this.logger.log('Iniciando tarea programada: Cleanup de bloques de contenido huérfanos');
  }
}
