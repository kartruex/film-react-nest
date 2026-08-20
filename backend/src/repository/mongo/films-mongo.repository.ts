import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from './schemas/film.schema';
import {
  FilmEntity,
  IFilmsRepository,
  ScheduleEntity,
  SeatCoordinate,
} from '../films-repository.interface';

@Injectable()
export class FilmsMongoRepository implements IFilmsRepository {
  constructor(
    @InjectModel(Film.name) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async findAll(): Promise<FilmEntity[]> {
    const docs = await this.filmModel.find().lean().exec();
    return docs.map((doc) => this.toFilmEntity(doc));
  }

  async findById(id: string): Promise<FilmEntity | null> {
    const doc = await this.filmModel.findOne({ id }).lean().exec();
    return doc ? this.toFilmEntity(doc) : null;
  }

  async bookSeats(
    filmId: string,
    scheduleId: string,
    seats: SeatCoordinate[],
  ): Promise<ScheduleEntity> {
    const seatKeys = seats.map((s) => `${s.row}:${s.seat}`);

    // taken: { $nin: seatKeys } — обновит документ, только если все места ещё свободны
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: { id: scheduleId, taken: { $nin: seatKeys } },
          },
        },
        { $push: { 'schedule.$.taken': { $each: seatKeys } } },
      )
      .exec();

    if (result.matchedCount === 0) {
      const film = await this.filmModel.findOne({ id: filmId }).lean().exec();
      if (!film) {
        throw new NotFoundException(`Фильм с id "${filmId}" не найден`);
      }
      const schedule = film.schedule.find((s) => s.id === scheduleId);
      if (!schedule) {
        throw new NotFoundException(
          `Сеанс с id "${scheduleId}" у фильма "${filmId}" не найден`,
        );
      }
      const busy = seatKeys.filter((key) => schedule.taken.includes(key));
      throw new BadRequestException(`Места уже заняты: ${busy.join(', ')}`);
    }

    const updated = await this.filmModel.findOne({ id: filmId }).lean().exec();
    const schedule = updated!.schedule.find((s) => s.id === scheduleId)!;
    return this.toScheduleEntity(schedule);
  }

  private toFilmEntity(doc: Film): FilmEntity {
    return {
      id: doc.id,
      rating: doc.rating,
      director: doc.director,
      tags: doc.tags ?? [],
      title: doc.title,
      about: doc.about,
      description: doc.description,
      image: doc.image,
      cover: doc.cover,
      schedule: (doc.schedule ?? []).map((s) => this.toScheduleEntity(s)),
    };
  }

  private toScheduleEntity(s: ScheduleEntity): ScheduleEntity {
    return {
      id: s.id,
      daytime: s.daytime,
      hall: s.hall,
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken ?? [],
    };
  }
}
