export type HealthStatus = 'ok' | 'fail' | 'degraded';

export type HealthCheckName = 'mongodb' | 'env';

export interface HealthCheckResult {
  status: 'ok' | 'fail';
  latency_ms?: number;
  writable?: boolean;
  error?: string;
  missing?: string[];
}

export type HealthChecksMap = Partial<Record<HealthCheckName, HealthCheckResult>>;

export interface LivenessResponse {
  status: 'ok';
}

export interface ReadinessSuccessResponse {
  status: 'ok';
  service: string;
  version: string;
  uptime_seconds: number;
  checks: HealthChecksMap;
}

export interface ReadinessDegradedResponse {
  status: 'degraded';
  service: string;
  checks: HealthChecksMap;
}

export type ReadinessResponse = ReadinessSuccessResponse | ReadinessDegradedResponse;

export interface HealthCheckRunner {
  readonly name: HealthCheckName;
  check(): Promise<HealthCheckResult>;
}

export type EnabledHealthCheck = 'mongodb' | 'env';

export interface HealthModuleOptions {
  /** Checks a ejecutar en /health/ready. Si se omite, no se ejecuta ninguno. */
  checks?: EnabledHealthCheck[];
  /** Variables de entorno obligatorias (check `env`). */
  requiredEnvVars?: string[];
  /** Timeout por check en ms (default: 3000). */
  timeoutMs?: number;
  /** Nombre del servicio. Override de PROCESS_NAME / package.json. */
  serviceName?: string;
  /** Versión del servicio. Override de APP_VERSION / package.json. */
  serviceVersion?: string;
}

export const HEALTH_MODULE_OPTIONS = Symbol('HEALTH_MODULE_OPTIONS');
export const HEALTH_CHECK_RUNNERS = Symbol('HEALTH_CHECK_RUNNERS');

/** Token para cliente MongoDB (inyección en otros microservicios). */
export const HEALTH_MONGODB_CONNECTION = Symbol('HEALTH_MONGODB_CONNECTION');

export interface MongodbPingConnection {
  db: {
    admin(): {
      ping(): Promise<unknown>;
    };
  };
}
