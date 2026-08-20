import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmListResponseDto, ScheduleListResponseDto } from './dto/films.dto';

// + globalPrefix 'api/afisha' из main.ts => GET /api/afisha/films...
@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  findAll(): Promise<FilmListResponseDto> {
    return this.filmsService.getAllFilms();
  }

  @Get(':id/schedule')
  findSchedule(@Param('id') id: string): Promise<ScheduleListResponseDto> {
    return this.filmsService.getFilmSchedule(id);
  }
}
