import { Inject, Injectable, Optional } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EnabledHealthCheck,
  HEALTH_CHECK_RUNNERS,
  HEALTH_MODULE_OPTIONS,
  HealthCheckResult,
  HealthCheckRunner,
  HealthChecksMap,
  HealthModuleOptions,
  LivenessResponse,
  ReadinessResponse,
} from './interfaces/health.interfaces';
import { withTimeout } from './indicators/health-check.utils';

const DEFAULT_TIMEOUT_MS = 3000;

@Injectable()
export class HealthService {
  private readonly packageMeta: { name: string; version: string };
  private readonly options: HealthModuleOptions;
  private readonly runners: HealthCheckRunner[];

  constructor(
    @Optional()
    @Inject(HEALTH_MODULE_OPTIONS)
    options?: HealthModuleOptions,
    @Optional()
    @Inject(HEALTH_CHECK_RUNNERS)
    runners?: HealthCheckRunner[],
  ) {
    this.options = options ?? {};
    this.runners = runners ?? [];
    this.packageMeta = this.loadPackageMeta();
  }

  getLiveness(): LivenessResponse {
    return { status: 'ok' };
  }

  async getReadiness(): Promise<{ httpStatus: 200 | 503; body: ReadinessResponse }> {
    const enabled = new Set<EnabledHealthCheck>(this.options.checks ?? []);
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const selectedRunners = this.runners.filter((runner) => enabled.has(runner.name));

    const checks: HealthChecksMap = {};
    let hasFailure = false;

    const results = await Promise.all(
      selectedRunners.map(async (runner) => {
        const result = await withTimeout(() => runner.check(), timeoutMs);
        return { name: runner.name, result };
      }),
    );

    for (const { name, result } of results) {
      checks[name] = this.sanitizeCheckResult(result);
      if (result.status === 'fail') hasFailure = true;
    }

    const service = this.resolveServiceName();
    const version = this.resolveServiceVersion();

    if (hasFailure) {
      return {
        httpStatus: 503,
        body: {
          status: 'degraded',
          service,
          checks,
        },
      };
    }

    return {
      httpStatus: 200,
      body: {
        status: 'ok',
        service,
        version,
        uptime_seconds: Math.floor(process.uptime()),
        checks,
      },
    };
  }

  private sanitizeCheckResult(result: HealthCheckResult): HealthCheckResult {
    if (result.status === 'ok') {
      const ok: HealthCheckResult = { status: 'ok' };
      if (typeof result.latency_ms === 'number') ok.latency_ms = result.latency_ms;
      if (typeof result.writable === 'boolean') ok.writable = result.writable;
      return ok;
    }

    const fail: HealthCheckResult = { status: 'fail' };
    if (result.error) fail.error = result.error;
    if (result.missing?.length) fail.missing = result.missing;
    if (typeof result.writable === 'boolean') fail.writable = result.writable;
    return fail;
  }

  private resolveServiceName(): string {
    return (
      this.options.serviceName ||
      process.env.PROCESS_NAME ||
      this.packageMeta.name ||
      'unknown-service'
    );
  }

  private resolveServiceVersion(): string {
    return (
      this.options.serviceVersion || process.env.APP_VERSION || this.packageMeta.version || '0.0.0'
    );
  }

  private loadPackageMeta(): { name: string; version: string } {
    try {
      const cwd = process.cwd();
      const packageJsonPath = join(cwd, cwd.includes('dist') ? '../package.json' : 'package.json');
      const raw = readFileSync(packageJsonPath, 'utf8');
      const parsed = JSON.parse(raw) as { name?: string; version?: string };
      return {
        name: parsed.name ?? 'unknown-service',
        version: parsed.version ?? '0.0.0',
      };
    } catch {
      return { name: 'unknown-service', version: '0.0.0' };
    }
  }
}
