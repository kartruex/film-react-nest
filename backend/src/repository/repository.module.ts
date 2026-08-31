import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CONFIG, AppConfig } from '../app.config.provider';
import { FILMS_REPOSITORY } from './films-repository.interface';
import { FilmsInMemoryRepository } from './in-memory/films-in-memory.repository';
import { FilmsTypeormRepository } from './typeorm/films-typeorm.repository';
import { Film } from './typeorm/entities/film.entity';
import { Schedule } from './typeorm/entities/schedule.entity';

function parseDatabaseUrl(url: string): {
  host: string;
  port: number;
  database: string;
} {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
  };
}

@Global()
@Module({})
export class RepositoryModule {
  static forRoot(driver: string): DynamicModule {
    if (driver === 'memory') {
      return {
        module: RepositoryModule,
        providers: [
          FilmsInMemoryRepository,
          { provide: FILMS_REPOSITORY, useExisting: FilmsInMemoryRepository },
        ],
        exports: [FILMS_REPOSITORY],
      };
    }

    return {
      module: RepositoryModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [CONFIG],
          useFactory: (config: AppConfig) => ({
            type: 'postgres',
            ...parseDatabaseUrl(config.database.url),
            username: config.database.username,
            password: config.database.password,
            entities: [Film, Schedule],
            synchronize: true,
          }),
        }),
        TypeOrmModule.forFeature([Film, Schedule]),
      ],
      providers: [
        FilmsTypeormRepository,
        { provide: FILMS_REPOSITORY, useExisting: FilmsTypeormRepository },
      ],
      exports: [FILMS_REPOSITORY],
    };
  }
}
