import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  formatMessage(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      optionalParams,
    });
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.formatMessage('log', message, optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    console.error(this.formatMessage('error', message, optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(this.formatMessage('warn', message, optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    console.debug(this.formatMessage('debug', message, optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    console.log(this.formatMessage('verbose', message, optionalParams));
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    console.error(this.formatMessage('fatal', message, optionalParams));
  }
}
