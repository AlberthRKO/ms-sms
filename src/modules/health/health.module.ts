import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { MongodbHealthIndicator } from './indicators/mongodb.health';
import { EnvHealthIndicator } from './indicators/env.health';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import {
  EnabledHealthCheck,
  HEALTH_CHECK_RUNNERS,
  HEALTH_MODULE_OPTIONS,
  HealthCheckRunner,
  HealthModuleOptions,
} from './interfaces/health.interfaces';

const CHECK_PROVIDER_MAP: Record<EnabledHealthCheck, Type<HealthCheckRunner>> = {
  mongodb: MongodbHealthIndicator,
  env: EnvHealthIndicator,
};

@Module({})
export class HealthModule {
  /**
   * Registra endpoints GET /health/live y GET /health/ready con los checks indicados.
   */
  static forRoot(options: HealthModuleOptions = {}): DynamicModule {
    const enabledChecks = [...new Set(options.checks ?? [])];
    const uniqueIndicators = [...new Set(enabledChecks.map((check) => CHECK_PROVIDER_MAP[check]))];

    const runnersProvider: Provider =
      enabledChecks.length > 0
        ? {
            provide: HEALTH_CHECK_RUNNERS,
            useFactory: (...runners: HealthCheckRunner[]) => runners,
            inject: enabledChecks.map((check) => CHECK_PROVIDER_MAP[check]),
          }
        : {
            provide: HEALTH_CHECK_RUNNERS,
            useValue: [],
          };

    return {
      module: HealthModule,
      controllers: [HealthController],
      providers: [
        {
          provide: HEALTH_MODULE_OPTIONS,
          useValue: {
            ...options,
            checks: enabledChecks,
          },
        },
        ...uniqueIndicators,
        runnersProvider,
        HealthService,
      ],
      exports: [HealthService],
    };
  }
}
