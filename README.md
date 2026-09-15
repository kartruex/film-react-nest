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
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME` — хост, порт и имя базы
  PostgreSQL (по умолчанию `localhost`, `5432`, `films`).
- `DATABASE_USERNAME`, `DATABASE_PASSWORD` — логин и пароль пользователя БД.

## Фронтенд

```bash
cd frontend
npm ci
npm run dev
```

## Логирование

Бэкенд поддерживает три логгера, выбор — через переменную окружения
`LOG_FORMAT` (`backend/.env`):

- `dev` (по умолчанию) — цветной консольный вывод Nest (`DevLogger`).
- `json` — построчный JSON (`JsonLogger`).
- `tskv` — формат Tab-Separated Key-Value (`TskvLogger`).

## Деплой

Проект докеризирован: `backend/Dockerfile`, `frontend/Dockerfile`,
`nginx/Dockerfile` (multi-stage, в финальных образах нет исходников и
dev-зависимостей). Все сервисы описаны в корневом `docker-compose.yml`
(`backend`, `frontend`, `nginx`, `db` — PostgreSQL, `pgadmin`).

Локальный запуск:

```bash
cp .env.example .env   # при необходимости поправьте значения
docker compose up -d --build
```

После запуска доступны:
- `http://localhost` — приложение (фронтенд + API через nginx);
- `http://localhost:8080` — pgAdmin (для наполнения БД см. раздел
  «PostgreSQL» выше, файлы — в `backend/test`).

При пуше в `main` GitHub Actions (`.github/workflows/docker-publish.yml`)
собирает и публикует образы `backend`, `frontend`, `nginx` в
`ghcr.io/kartruex/film-react-nest-*`. На сервере используется тот же
`docker-compose.yml`, но без сборки — образы просто спулливаются:

```bash
docker compose pull
docker compose up -d
```

Задеплоенное приложение: _ссылка появится после привязки домена
(`domain.nomoreparties.site`) к серверу_.
