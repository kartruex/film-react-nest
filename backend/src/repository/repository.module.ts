import { DynamicModule, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG, AppConfig } from '../app.config.provider';
import { FILMS_REPOSITORY } from './films-repository.interface';
import { FilmsInMemoryRepository } from './in-memory/films-in-memory.repository';
import { FilmsMongoRepository } from './mongo/films-mongo.repository';
import { Film, FilmSchema } from './mongo/schemas/film.schema';

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
        MongooseModule.forRootAsync({
          inject: [CONFIG],
          useFactory: (config: AppConfig) => ({ uri: config.database.url }),
        }),
        MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
      ],
      providers: [
        FilmsMongoRepository,
        { provide: FILMS_REPOSITORY, useExisting: FilmsMongoRepository },
      ],
      exports: [FILMS_REPOSITORY],
    };
  }
}
