# Film! — backend (NestJS)

Бэкенд-часть онлайн-сервиса бронирования билетов в кинотеатр. Реализует
раздел `/api/afisha` (список фильмов, расписание сеансов, бронирование
билетов) и раздачу статического контента афиш.

## Установка

```bash
npm install
cp .env.example .env
```

Переменные окружения:

- `DATABASE_DRIVER` — `postgres` (по умолчанию) или `memory` (данные из
  `src/repository/in-memory/films.seed.json`, без подключения к БД — удобно
  для быстрого запуска и e2e-тестов).
- `DATABASE_URL` — строка подключения к PostgreSQL,
  например `postgres://localhost:5432/films`.
- `DATABASE_USERNAME`, `DATABASE_PASSWORD` — логин и пароль пользователя БД.

## PostgreSQL

Поднимите базу и загрузите тестовые данные (из корня репозитория):

```bash
docker-compose up -d
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.init.sql
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.films.sql
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.shedules.sql
```

Один фильм (`films`) → много сеансов (`schedules`), связь по внешнему ключу
`schedules."filmId"`.

## Запуск

```bash
npm run start:dev
```

## Тесты и линт

```bash
npm run lint
npm run build
npm run test:e2e
```

`in-memory` и `typeorm` (PostgreSQL) репозитории реализуют общий интерфейс
`IFilmsRepository` (`src/repository/films-repository.interface.ts`),
поэтому переключение источника данных — это только смена `DATABASE_DRIVER`,
без правок контроллеров и сервисов.
