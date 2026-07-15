import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  HEALTH_MONGODB_CONNECTION,
  HealthCheckName,
  HealthCheckResult,
  HealthCheckRunner,
  MongodbPingConnection,
} from '../interfaces/health.interfaces';
import { measureLatencyMs, toErrorMessage } from './health-check.utils';

/**
 * Ping a MongoDB vía conexión Mongoose/driver (`db.admin().ping()`).
 * Opcional: solo se usa si el microservicio registra HEALTH_MONGODB_CONNECTION.
 */
@Injectable()
export class MongodbHealthIndicator implements HealthCheckRunner {
  readonly name: HealthCheckName = 'mongodb';

  constructor(
    @Optional()
    @Inject(HEALTH_MONGODB_CONNECTION)
    private readonly connection?: MongodbPingConnection,
  ) {}

  async check(): Promise<HealthCheckResult> {
    if (!this.connection?.db) {
      return {
        status: 'fail',
        error: 'mongodb connection not registered',
      };
    }

    const startedAt = performance.now();
    try {
      await this.connection.db.admin().ping();
      return {
        status: 'ok',
        latency_ms: measureLatencyMs(startedAt),
      };
    } catch (error) {
      return {
        status: 'fail',
        error: toErrorMessage(error),
      };
    }
  }
}
