import { safeJson } from './masking';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface Logger { log(level: LogLevel, event: string, data?: Record<string, unknown>): void; }

export class ConsoleLogger implements Logger {
  constructor(private readonly context = 'api') {}
  log(level: LogLevel, event: string, data: Record<string, unknown> = {}): void {
    if (level === 'debug' && process.env.LOG_LEVEL !== 'debug') return;
    console.log(`[${new Date().toISOString()}] ${level.toUpperCase()} [${this.context}] ${event} ${safeJson(data)}`);
  }
}
