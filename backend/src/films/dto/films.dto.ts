export class ScheduleDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule: ScheduleDto[];
}

export class FilmListResponseDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleListResponseDto {
  total: number;
  items: ScheduleDto[];
}
