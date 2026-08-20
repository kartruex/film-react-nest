import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';

import { AppConfigModule } from './app.config.provider';
import { RepositoryModule } from './repository/repository.module';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    // должен стоять раньше RepositoryModule.forRoot() — тот читает process.env синхронно
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AppConfigModule,
    // GET /content/afisha/* -> backend/public/content/afisha/*
    // renderPath переопределён, чтобы отключить встроенный SPA-фолбэк
    // (по умолчанию модуль на любой не найденный файл пытается отдать index.html)
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      renderPath: '/__never__',
    }),
    RepositoryModule.forRoot(process.env.DATABASE_DRIVER ?? 'mongodb'),
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
