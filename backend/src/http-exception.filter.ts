import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Приводит ошибки к формату { error: string }, который ждёт фронтенд и film.yml
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Внутренняя ошибка сервера';
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const maybeMessage = (body as { message?: string | string[] }).message;
        message = Array.isArray(maybeMessage)
          ? maybeMessage.join('; ')
          : maybeMessage ?? exception.message;
      }
    } else {
      // непредвиденная (не-HttpException) ошибка — печатаем стектрейс в консоль сервера,
      // клиенту при этом всё равно уходит только общий текст
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json({ error: message });
  }
}
