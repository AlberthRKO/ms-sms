import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  HEALTH_MODULE_OPTIONS,
  HealthCheckName,
  HealthCheckResult,
  HealthCheckRunner,
  HealthModuleOptions,
} from '../interfaces/health.interfaces';

/**
 * Valida que las variables de entorno críticas estén definidas.
 * Si falta alguna, el readiness debe degradarse (503).
 */
@Injectable()
export class EnvHealthIndicator implements HealthCheckRunner {
  readonly name: HealthCheckName = 'env';

  constructor(
    @Optional()
    @Inject(HEALTH_MODULE_OPTIONS)
    private readonly options?: HealthModuleOptions,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async check(): Promise<HealthCheckResult> {
    const required = this.options?.requiredEnvVars ?? [];
    if (required.length === 0) {
      return { status: 'ok' };
    }

    const missing = required.filter((key) => {
      const value = process.env[key];
      return value === undefined || value.trim() === '';
    });

    if (missing.length > 0) {
      return {
        status: 'fail',
        error: `missing required env vars: ${missing.join(', ')}`,
        missing,
      };
    }

    return { status: 'ok' };
  }
}
