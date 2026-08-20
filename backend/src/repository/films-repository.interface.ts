export const FILMS_REPOSITORY = Symbol('FILMS_REPOSITORY');

export interface ScheduleEntity {
  id: string;
  daytime: Date | string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  // "${row}:${seat}"
  taken: string[];
}

export interface FilmEntity {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule: ScheduleEntity[];
}

export interface SeatCoordinate {
  row: number;
  seat: number;
}

export interface IFilmsRepository {
  findAll(): Promise<FilmEntity[]>;

  findById(id: string): Promise<FilmEntity | null>;

  // NotFoundException — фильм/сеанс не найден; BadRequestException — место занято
  bookSeats(
    filmId: string,
    scheduleId: string,
    seats: SeatCoordinate[],
  ): Promise<ScheduleEntity>;
}
