import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  FILMS_REPOSITORY,
  IFilmsRepository,
} from '../repository/films-repository.interface';
import {
  FilmNotFoundError,
  ScheduleNotFoundError,
  SeatsAlreadyTakenError,
} from '../repository/repository.errors';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderResultDto,
  TicketDto,
} from './dto/order.dto';

interface SessionGroup {
  filmId: string;
  scheduleId: string;
  tickets: TicketDto[];
}

@Injectable()
export class OrderService {
  constructor(
    @Inject(FILMS_REPOSITORY)
    private readonly filmsRepository: IFilmsRepository,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    if (!dto.tickets || dto.tickets.length === 0) {
      throw new BadRequestException('Список билетов пуст');
    }

    // дубли мест внутри одного заказа
    const seen = new Set<string>();
    for (const ticket of dto.tickets) {
      const key = `${ticket.session}:${ticket.row}:${ticket.seat}`;
      if (seen.has(key)) {
        throw new BadRequestException(
          `Место ${ticket.row}:${ticket.seat} указано в заказе больше одного раза`,
        );
      }
      seen.add(key);
    }

    // группировка по сеансу — один вызов bookSeats на сеанс
    const groups = new Map<string, SessionGroup>();
    for (const ticket of dto.tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      const group = groups.get(key) ?? {
        filmId: ticket.film,
        scheduleId: ticket.session,
        tickets: [],
      };
      group.tickets.push(ticket);
      groups.set(key, group);
    }

    // предварительная проверка занятости по всем сеансам заказа
    for (const group of groups.values()) {
      const film = await this.filmsRepository.findById(group.filmId);
      if (!film) {
        throw new BadRequestException(`Фильм с id "${group.filmId}" не найден`);
      }
      const schedule = film.schedule.find((s) => s.id === group.scheduleId);
      if (!schedule) {
        throw new BadRequestException(
          `Сеанс с id "${group.scheduleId}" не найден`,
        );
      }
      const taken = new Set(schedule.taken);
      const busy = group.tickets.filter((t) => taken.has(`${t.row}:${t.seat}`));
      if (busy.length > 0) {
        const list = busy.map((t) => `${t.row}:${t.seat}`).join(', ');
        throw new BadRequestException(`Места уже заняты: ${list}`);
      }
    }

    for (const group of groups.values()) {
      const seats = group.tickets.map((t) => ({ row: t.row, seat: t.seat }));
      try {
        await this.filmsRepository.bookSeats(
          group.filmId,
          group.scheduleId,
          seats,
        );
      } catch (error) {
        if (
          error instanceof FilmNotFoundError ||
          error instanceof ScheduleNotFoundError ||
          error instanceof SeatsAlreadyTakenError
        ) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }
    }

    const items: OrderResultDto[] = dto.tickets.map((ticket) => ({
      film: ticket.film,
      session: ticket.session,
      daytime: ticket.daytime,
      row: ticket.row,
      seat: ticket.seat,
      price: ticket.price,
      id: randomUUID(),
    }));

    return { total: items.length, items };
  }
}
