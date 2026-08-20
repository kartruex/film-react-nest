# Film! — backend (NestJS)

Бэкенд-часть онлайн-сервиса бронирования билетов в кинотеатр. Реализует
раздел `/api/afisha` (список фильмов, расписание сеансов, бронирование
билетов) и раздачу статического контента афиш.

## Установка

```bash
npm install
```

Скопируйте `.env.example` в `.env` и при необходимости поправьте значения:

```bash
cp .env.example .env
```

- `DATABASE_DRIVER` — `mongodb` (по умолчанию) или `memory` (данные из
  `src/repository/in-memory/films.seed.json`, без подключения к MongoDB —
  удобно для быстрого запуска и e2e-тестов).
- `DATABASE_URL` — строка подключения к MongoDB.

## Запуск

```bash
npm run start:dev
```

## MongoDB

Фильмы хранятся в коллекции `films`, расписание сеансов — в виде
поддокумента. Импортируйте фильмы из `test/mongodb_initial_stub.json`
через Compass (Add Data → Import JSON or CSV file) в коллекцию `films`
базы, указанной в `DATABASE_URL`. Афиши для каждого фильма должны лежать
в `backend/public` — путь берётся из полей `image`/`cover` документа.

## Тесты и линт

```bash
npm run lint
npm run build
npm run test:e2e
```

`in-memory` и `mongodb` репозитории реализуют общий интерфейс
`IFilmsRepository` (`src/repository/films-repository.interface.ts`),
поэтому переключение источника данных — это только смена
`DATABASE_DRIVER`, без правок контроллеров и сервисов.
