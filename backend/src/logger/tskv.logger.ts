import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

const TSKV_FORMAT_NAME = 'film-react-nest-log';

@Injectable()
export class TskvLogger implements LoggerService {
  private toRawValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value instanceof Error) {
      return value.stack ?? value.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  // TSKV — плоский формат: значение не может содержать \t или \n, поэтому экранируем их.
  private escapeValue(value: unknown): string {
    return this.toRawValue(value)
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n');
  }

  formatMessage(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): string {
    const fields: [string, unknown][] = [
      ['tskv_format', TSKV_FORMAT_NAME],
      ['timestamp', new Date().toISOString()],
      ['level', level],
      ['message', message],
    ];

    if (optionalParams.length > 0) {
      fields.push(['params', optionalParams]);
    }

    const line = fields
      .map(([key, value]) => `${key}=${this.escapeValue(value)}`)
      .join('\t');

    return `${line}\n`;
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(this.formatMessage('log', message, optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    process.stderr.write(this.formatMessage('error', message, optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(this.formatMessage('warn', message, optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(this.formatMessage('debug', message, optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(
      this.formatMessage('verbose', message, optionalParams),
    );
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    process.stderr.write(this.formatMessage('fatal', message, optionalParams));
  }
}
