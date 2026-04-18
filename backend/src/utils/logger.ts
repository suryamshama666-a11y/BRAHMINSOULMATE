/**
 * Centralized logging utility for production-safe logging
 * Replaces console.log/warn/error with structured logging
 */

import { LogEntry } from '../types/domain';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
        reset: '\x1b[0m',
      };

      const color = colors[entry.level];
      const prefix = `${color}[${entry.level.toUpperCase()}]${colors.reset}`;
      
      if (entry.data) {
        console.log(`${prefix} ${entry.message}`, entry.data);
      } else {
        console.log(`${prefix} ${entry.message}`);
      }
    } else {
      // In production, output JSON for log aggregation services
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('debug', message, data));
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.output(this.formatLog('warn', message, data));
  }

  error(message: string, data?: Record<string, unknown> | unknown): void {
    // Convert unknown to a safe record format
    let safeData: Record<string, unknown> | undefined;
    if (data !== undefined) {
      if (data instanceof Error) {
        safeData = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else if (typeof data === 'object' && data !== null) {
        safeData = data as Record<string, unknown>;
      } else {
        safeData = { value: String(data) };
      }
    }
    this.output(this.formatLog('error', message, safeData));
  }

  // Alias for console.log compatibility
  log(message: string, data?: Record<string, unknown>): void {
    this.info(message, data);
  }
}

export const logger = new Logger();
