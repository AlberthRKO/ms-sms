import { HealthCheckResult } from '../interfaces/health.interfaces';

/**
 * Ejecuta un check con timeout. Si supera `timeoutMs`, retorna fail.
 */
export async function withTimeout(
  checkFn: () => Promise<HealthCheckResult>,
  timeoutMs: number,
  timeoutError = 'connection timeout',
): Promise<HealthCheckResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      checkFn(),
      new Promise<HealthCheckResult>((resolve) => {
        timer = setTimeout(() => resolve({ status: 'fail', error: timeoutError }), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function measureLatencyMs(startedAt: number): number {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'unknown error';
}
