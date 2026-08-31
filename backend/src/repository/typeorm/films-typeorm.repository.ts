import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  FilmEntity,
  IFilmsRepository,
  ScheduleEntity,
  SeatCoordinate,
} from '../films-repository.interface';
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
        throw new NotFoundException(`Фильм с id "${filmId}" не найден`);
      }

      const schedule = await manager.findOne(Schedule, {
        where: { id: scheduleId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!schedule || schedule.filmId !== filmId) {
        throw new NotFoundException(
          `Сеанс с id "${scheduleId}" у фильма "${filmId}" не найден`,
        );
      }

      const taken = this.parseTaken(schedule.taken);
      const busy = seatKeys.filter((key) => taken.includes(key));
      if (busy.length > 0) {
        throw new BadRequestException(`Места уже заняты: ${busy.join(', ')}`);
      }

      schedule.taken = [...taken, ...seatKeys].join(',');
      await manager.save(Schedule, schedule);

      return this.toScheduleEntity(schedule);
    });
  }

  private parseTaken(value: string): string[] {
    return value ? value.split(',').filter(Boolean) : [];
  }

  private parseTags(value: string): string[] {
    return value ? value.split(',').map((tag) => tag.trim()) : [];
  }

  private toScheduleEntity(schedule: Schedule): ScheduleEntity {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: this.parseTaken(schedule.taken),
    };
  }

  private toFilmEntity(film: Film): FilmEntity {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: this.parseTags(film.tags),
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      schedule: (film.schedule ?? []).map((s) => this.toScheduleEntity(s)),
    };
  }
}
