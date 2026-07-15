import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { HealthService } from './health.service';

/**
 * Endpoints institucionales de liveness/readiness.
 * Usan el formato de respuesta estándar del proyecto vía ResponseFormatInterceptor.
 *
 * Rutas: GET /health/live · GET /health/ready
 */
@ApiTags('HEALTH')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Valida únicamente que el proceso esté vivo. No consulta bases de datos ni dependencias externas.',
  })
  @ApiResponse({ status: 200, description: 'Proceso vivo' })
  getLive() {
    return { data: this.healthService.getLiveness() };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Valida dependencias críticas configuradas. 200 si todas OK; 503 si alguna falla o falta env mandatoria.',
  })
  @ApiResponse({ status: 200, description: 'Listo para tráfico' })
  @ApiResponse({ status: 503, description: 'Degradado / no listo' })
  async getReady(@Res({ passthrough: true }) res: FastifyReply) {
    const { httpStatus, body } = await this.healthService.getReadiness();
    res.status(httpStatus);
    return { data: body };
  }
}
