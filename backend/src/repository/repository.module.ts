import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CONFIG, AppConfig } from '../app.config.provider';
import { FILMS_REPOSITORY } from './films-repository.interface';
import { FilmsInMemoryRepository } from './in-memory/films-in-memory.repository';
import { FilmsTypeormRepository } from './typeorm/films-typeorm.repository';
import { Film } from './typeorm/entities/film.entity';
import { Schedule } from './typeorm/entities/schedule.entity';

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
            host: config.database.host,
            port: config.database.port,
            database: config.database.name,
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
