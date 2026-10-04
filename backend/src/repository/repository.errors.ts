// Доменные ошибки слоя данных. Репозиторий ничего не знает про HTTP —
// сервис ловит эти ошибки и сам решает, каким HTTP-ответом их отдать.

export class FilmNotFoundError extends Error {
  constructor(public readonly filmId: string) {
    super(`Фильм с id "${filmId}" не найден`);
    this.name = 'FilmNotFoundError';
  }
}

export class ScheduleNotFoundError extends Error {
  constructor(
    public readonly scheduleId: string,
    public readonly filmId: string,
  ) {
    super(`Сеанс с id "${scheduleId}" у фильма "${filmId}" не найден`);
    this.name = 'ScheduleNotFoundError';
  }
}

export class SeatsAlreadyTakenError extends Error {
  constructor(public readonly seats: string[]) {
    super(`Места уже заняты: ${seats.join(', ')}`);
    this.name = 'SeatsAlreadyTakenError';
  }
}
