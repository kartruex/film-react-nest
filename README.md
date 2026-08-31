# FILM!

Онлайн-сервис бронирования билетов в кинотеатр. Фронтенд на React, бэкенд на
NestJS. Данные о фильмах, сеансах и бронированиях хранятся в PostgreSQL
(доступ через TypeORM).

## PostgreSQL

Проще всего поднять базу через Docker:

```bash
docker-compose up -d
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.init.sql
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.films.sql
docker exec -i postgres_container psql -U postgres -d films < backend/test/prac.shedules.sql
```

Либо установите PostgreSQL локально, создайте пользователя и базу и выполните
те же SQL-файлы из `backend/test`.

## Бэкенд

```bash
cd backend
npm ci
cp .env.example .env   # при необходимости поправьте значения
npm run start:dev
```

Переменные окружения (`backend/.env`):

- `DATABASE_DRIVER` — `postgres` (или `memory` для запуска без БД, данные из
  `src/repository/in-memory/films.seed.json` — используется в e2e-тестах).
- `DATABASE_URL` — строка подключения к PostgreSQL,
  например `postgres://localhost:5432/films`.
- `DATABASE_USERNAME`, `DATABASE_PASSWORD` — логин и пароль пользователя БД.

## Фронтенд

```bash
cd frontend
npm ci
npm run dev
```
