# AutoDoc

Выездной автосервис: Telegram deep-link auth, личный кабинет, заявки на ремонт.

## Структура

```
Project_1/
  docker-compose.yml   # PostgreSQL
  prisma/              # schema, migrations, seed
  apps/api/            # Express API (порт 3001)
  apps/bot/            # Telegram bot process
  apps/web/            # Vite React (отдельный фронтенд)
```

## Быстрый старт

Порядок из корня репозитория (три терминала для api / bot / web):

```bash
cp .env.example .env
# заполните TELEGRAM_BOT_TOKEN и SESSION_SECRET (≥ 16 символов)

npm install
npm run docker:up          # Postgres на localhost:5433
npm run db:generate
npm run db:migrate         # применяет миграции
npm run db:seed            # 8 услуг каталога

npm run dev:api            # http://localhost:3001
npm run bot:telegram       # отдельный процесс (нужен TELEGRAM_BOT_TOKEN)
npm run dev:web            # http://localhost:5173 → proxy /api → :3001
```

Остановка Postgres: `npm run docker:down`.

## Env

Скопируйте `.env.example` → `.env` и заполните:

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | Postgres (по умолчанию `localhost:5433` → контейнер) |
| `TELEGRAM_BOT_TOKEN` | токен от @BotFather (нужен процессу бота) |
| `TELEGRAM_BOT_USERNAME` | username бота **без** `@` |
| `APP_URL` | origin Vite (`http://localhost:5173`) — CORS + cookie |
| `API_URL` | origin API (`http://localhost:3001`) |
| `PORT` | порт API (по умолчанию `3001`) |
| `SESSION_SECRET` | секрет ≥ 16 символов |
| `COOKIE_NAME` | `autodoc_session` (httpOnly; web читает сессию через `/api/me`) |
| `NODE_ENV` | `development` / `production` |

`TELEGRAM_BOT_TOKEN` и `TELEGRAM_BOT_USERNAME` должны указывать на **одного** бота.

## Docker (Postgres)

```bash
npm run docker:up
# или: docker compose up -d
```

Postgres проброшен на хост-порт **5433** (чтобы не конфликтовать с локальным 5432).  
Проверка: `docker compose ps` — контейнер `autodoc-postgres` healthy.

## База данных (Prisma)

См. шаги `db:generate` / `db:migrate` / `db:seed` в [Быстрый старт](#быстрый-старт).

## API

```bash
npm run dev:api
```

Слушает `http://localhost:3001`. Health: `GET /api/health`.

Основные маршруты:

- `POST /api/auth/telegram/start` · `GET /api/auth/telegram/poll`
- `POST /api/auth/logout`
- `GET|PATCH /api/me`
- `GET /api/services`
- `GET|POST /api/requests` · `GET|PATCH|DELETE /api/requests/:id`
- `POST /api/contact`

Сессия: httpOnly cookie `autodoc_session` (в БД хранится hash токена, TTL 30 дней). CORS разрешён для `APP_URL` с `credentials`.

## Telegram bot

Бот — **отдельный** процесс (без него poll останется в `PENDING`):

```bash
npm run bot:telegram
# или: npm run dev:bot
```

Флоу: сайт создаёт `PendingAuth` → deep-link `t.me/<bot>?start=<nonce>` → `/start <nonce>` upsert User и `COMPLETED` → poll claim’ает nonce и ставит cookie.

## Frontend (Vite + React)

Пакет `apps/web` (`@autodoc/web`). React Router, отдельные CSS, Telegram deep-link login, ЛК и CRUD заявок.

```bash
npm run dev:web
# или: npm run dev
```

Откроется `http://localhost:5173`. По умолчанию `VITE_API_URL` **не задан**: запросы идут на относительные `/api/*` и проксируются Vite → `http://localhost:3001` (`credentials: include`).

Опционально `apps/web/.env` (см. `apps/web/.env.example`) для прямого обращения к API без proxy:

```
VITE_API_URL=http://localhost:3001
```

### Маршруты

| Путь | Страница |
|---|---|
| `/` | Главная (hero, параллакс, смена темы по скроллу) |
| `/services` | Каталог услуг из `GET /api/services` |
| `/cabinet` | Профиль + CRUD заявок (нужна сессия) |
| `/cabinet/requests/new` | Новая заявка |
| `/login` | Вход через Telegram |
| `/register` | Регистрация через Telegram (тот же флоу, другой текст) |
| `/about` | О сервисе |
| `/contacts` | Контакты + форма → `POST /api/contact` |

Для полного флоу auth нужны одновременно **API**, **бот** и **web**.
