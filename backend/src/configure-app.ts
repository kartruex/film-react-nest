import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'node:path';
import { HttpExceptionFilter } from './http-exception.filter';

// Общая настройка приложения: используется и в проде (main.ts), и в e2e-тестах,
// чтобы тестовое окружение точно соответствовало реальному бутстрапу.
// useStaticAssets() нужен как подстраховка: ServeStaticModule (см. app.module.ts)
// в NestJS TestingModule инициализируется через NoopLoader из-за особенности DI
// (HttpAdapterHost ещё не готов на момент резолва провайдера), поэтому в e2e-тестах
// раздачу статики обеспечивает именно эта строка.
export function configureApp(app: NestExpressApplication): INestApplication {
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  app.setGlobalPrefix('api/afisha');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
}
