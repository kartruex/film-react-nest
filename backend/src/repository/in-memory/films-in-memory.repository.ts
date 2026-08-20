import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  FilmEntity,
  IFilmsRepository,
  ScheduleEntity,
  SeatCoordinate,
} from '../films-repository.interface';

@Injectable()
export class FilmsInMemoryRepository implements IFilmsRepository {
  private readonly logger = new Logger(FilmsInMemoryRepository.name);
  private readonly films: FilmEntity[];

  constructor() {
    this.films = this.loadSeedData();
    this.logger.log(
      `In-memory репозиторий фильмов инициализирован: ${this.films.length} фильм(ов)`,
    );
  }

  private loadSeedData(): FilmEntity[] {
    const seedPath = path.join(__dirname, 'films.seed.json');
    try {
      const raw = fs.readFileSync(seedPath, 'utf-8');
      return JSON.parse(raw) as FilmEntity[];
    } catch (error) {
      this.logger.warn(
        `Не удалось прочитать ${seedPath} (${(error as Error).message}). ` +
          'Стартуем с пустым списком фильмов.',
      );
      return [];
    }
  }

  async findAll(): Promise<FilmEntity[]> {
    return this.films;
  }

  async findById(id: string): Promise<FilmEntity | null> {
    return this.films.find((film) => film.id === id) ?? null;
  }

  async bookSeats(
    filmId: string,
    scheduleId: string,
    seats: SeatCoordinate[],
  ): Promise<ScheduleEntity> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) {
      throw new NotFoundException(`Фильм с id "${filmId}" не найден`);
    }

    const schedule = film.schedule.find((s) => s.id === scheduleId);
    if (!schedule) {
      throw new NotFoundException(
        `Сеанс с id "${scheduleId}" у фильма "${filmId}" не найден`,
      );
    }

    const keys = seats.map((s) => `${s.row}:${s.seat}`);
    const alreadyTaken = keys.filter((key) => schedule.taken.includes(key));
    if (alreadyTaken.length > 0) {
      throw new BadRequestException(
        `Места уже заняты: ${alreadyTaken.join(', ')}`,
      );
    }

    // без await между проверкой и записью — гонка состояний исключена
    schedule.taken.push(...keys);

    return schedule;
  }
}
