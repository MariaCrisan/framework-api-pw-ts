import type { LogLevel } from '../config/config-loader';
import { config } from '../config/config';
import { safeJson } from './serialization';

const priority: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

export class Logger {
  constructor(private readonly level: LogLevel = config.logLevel) {}
  private write(level: LogLevel, message: string, details?: unknown): void {
    if (priority[level] > priority[this.level]) return;
    const suffix = details === undefined ? '' : ` ${safeJson(details)}`;
    console[level === 'debug' ? 'log' : level](`[api] ${message}${suffix}`);
  }
  error(message: string, details?: unknown): void { this.write('error', message, details); }
  warn(message: string, details?: unknown): void { this.write('warn', message, details); }
  info(message: string, details?: unknown): void { this.write('info', message, details); }
  debug(message: string, details?: unknown): void { this.write('debug', message, details); }
}

export const logger = new Logger();
