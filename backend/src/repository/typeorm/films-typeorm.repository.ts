import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  FilmEntity,
  IFilmsRepository,
  ScheduleEntity,
  SeatCoordinate,
} from '../films-repository.interface';
import {
  FilmNotFoundError,
  ScheduleNotFoundError,
  SeatsAlreadyTakenError,
} from '../repository.errors';
import { Film } from './entities/film.entity';
import { Schedule } from './entities/schedule.entity';

@Injectable()
export class FilmsTypeormRepository implements IFilmsRepository {
  constructor(
    @InjectRepository(Film)
    private readonly filmsRepository: Repository<Film>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<FilmEntity[]> {
    const films = await this.filmsRepository.find();
    return films.map((film) => this.toFilmEntity(film));
  }

  async findById(id: string): Promise<FilmEntity | null> {
    const film = await this.filmsRepository.findOne({ where: { id } });
    return film ? this.toFilmEntity(film) : null;
  }

  async bookSeats(
    filmId: string,
    scheduleId: string,
    seats: SeatCoordinate[],
  ): Promise<ScheduleEntity> {
    const seatKeys = seats.map((s) => `${s.row}:${s.seat}`);

    // транзакция + блокировка строки сеанса — параллельные брони не пересекутся
    return this.dataSource.transaction(async (manager) => {
      const film = await manager.findOne(Film, { where: { id: filmId } });
      if (!film) {
        throw new FilmNotFoundError(filmId);
      }

      const schedule = await manager.findOne(Schedule, {
        where: { id: scheduleId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!schedule || schedule.filmId !== filmId) {
        throw new ScheduleNotFoundError(scheduleId, filmId);
      }

      const busy = seatKeys.filter((key) => schedule.taken.includes(key));
      if (busy.length > 0) {
        throw new SeatsAlreadyTakenError(busy);
      }

      schedule.taken = [...schedule.taken, ...seatKeys];
      await manager.save(Schedule, schedule);

      return this.toScheduleEntity(schedule);
    });
  }

  private toScheduleEntity(schedule: Schedule): ScheduleEntity {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken,
    };
  }

  private toFilmEntity(film: Film): FilmEntity {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      schedule: (film.schedule ?? []).map((s) => this.toScheduleEntity(s)),
    };
  }
}
