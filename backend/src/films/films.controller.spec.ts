import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmListResponseDto, ScheduleListResponseDto } from './dto/films.dto';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: { getAllFilms: jest.Mock; getFilmSchedule: jest.Mock };

  beforeEach(async () => {
    service = {
      getAllFilms: jest.fn(),
      getFilmSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: service }],
    }).compile();

    controller = module.get(FilmsController);
  });

  describe('findAll', () => {
    it('вызывает service.getAllFilms и возвращает его результат', async () => {
      const response: FilmListResponseDto = { total: 0, items: [] };
      service.getAllFilms.mockResolvedValue(response);

      const result = await controller.findAll();

      expect(service.getAllFilms).toHaveBeenCalledTimes(1);
      expect(result).toBe(response);
    });
  });

  describe('findSchedule', () => {
    it('передаёт id фильма в service.getFilmSchedule и возвращает его результат', async () => {
      const response: ScheduleListResponseDto = { total: 0, items: [] };
      service.getFilmSchedule.mockResolvedValue(response);

      const result = await controller.findSchedule('film-id-1');

      expect(service.getFilmSchedule).toHaveBeenCalledWith('film-id-1');
      expect(result).toBe(response);
    });

    it('пробрасывает ошибку сервиса (например NotFoundException) наверх', async () => {
      const error = new Error('not found');
      service.getFilmSchedule.mockRejectedValue(error);

      await expect(controller.findSchedule('missing-id')).rejects.toThrow(
        error,
      );
    });
  });
});
