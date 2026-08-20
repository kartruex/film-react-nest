import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FILMS_REPOSITORY,
  IFilmsRepository,
} from '../repository/films-repository.interface';
import {
  FilmDto,
  FilmListResponseDto,
  ScheduleDto,
  ScheduleListResponseDto,
} from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: IFilmsRepository,
  ) {}

  async getAllFilms(): Promise<FilmListResponseDto> {
    const films = await this.filmsRepository.findAll();
    const items: FilmDto[] = films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));
    return { total: items.length, items };
  }

  async getFilmSchedule(filmId: string): Promise<ScheduleListResponseDto> {
    const film = await this.filmsRepository.findById(filmId);
    if (!film) {
      throw new NotFoundException(`Фильм с id "${filmId}" не найден`);
    }

    const items: ScheduleDto[] = film.schedule.map((session) => ({
      id: session.id,
      daytime: new Date(session.daytime).toISOString(),
      hall: session.hall,
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken,
    }));
    return { total: items.length, items };
  }
}
