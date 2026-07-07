# Turpan Fitness — Docker deployment

Everything runs in containers behind a single **nginx** entrypoint, on one shared
**PostgreSQL** database. Point Cloudflare at nginx (`:80`) and you're live.

```
                    ┌──────────────────────────────────────┐
   Cloudflare  ───▶ │ nginx :80                             │
   (TLS here)       │   /            → frontend  (Next.js)  │
                    │   /api, /docs  → backend   (FastAPI)  │
                    │   /admin, /ckeditor5 → admin (Django) │
                    │   /media, /static → shared volumes    │
                    └──────────────────────────────────────┘
        bot (aiogram)  ─┐
        admin / backend ┼──▶  db (PostgreSQL)   ← Django owns the schema
                        ─┘
```

## Services

| Service    | Build context      | Role                                             |
|------------|--------------------|--------------------------------------------------|
| `db`       | postgres:16-alpine | Shared PostgreSQL for all three backends         |
| `migrate`  | `./backend`        | One-shot: `migrate` + `collectstatic` + superuser|
| `admin`    | `./backend`        | Django/Jazzmin admin + CKEditor (schema owner)   |
| `backend`  | `./website_backend`| FastAPI public REST API                          |
| `bot`      | `./bot`            | Telegram bot (long polling)                      |
| `frontend` | `./frontend`       | Next.js site (standalone build)                  |
| `nginx`    | nginx:1.27-alpine  | Reverse proxy + static/media server              |

`migrate` runs first; `admin`, `backend` and `bot` only start **after** it
finishes, so the tables always exist before anyone queries them.

## Quick start

1. Start Docker Desktop (the daemon must be running).
2. Copy and edit env:
   ```bash
   cp .env.example .env      # a working .env is already provided for local dev
   ```
   Set at minimum: `POSTGRES_PASSWORD`, `DJANGO_SECRET_KEY`,
   `DJANGO_SUPERUSER_PASSWORD`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`.
3. Build & run:
   ```bash
   docker compose up -d --build
   ```
4. Open:
   - Site: <http://localhost/>
   - Admin: <http://localhost/admin/>  (login = `DJANGO_SUPERUSER_*`)
   - API docs: <http://localhost/docs>

Logs: `docker compose logs -f backend` · Stop: `docker compose down` ·
Wipe DB too: `docker compose down -v`.

## Connecting Cloudflare

nginx listens on plain HTTP `:80` and trusts the `X-Forwarded-Proto` header, so
either option works out of the box:

- **Proxied DNS (orange cloud):** point an `A`/`AAAA` record at the host, set SSL
  mode to *Full* or *Flexible*. Cloudflare terminates TLS and forwards to `:80`.
- **Cloudflare Tunnel (recommended, no open ports):** run `cloudflared` with an
  ingress rule to `http://<host-or-nginx>:80`.

Then set these in `.env` to your real domain and re-run `docker compose up -d`:

```
DJANGO_ALLOWED_HOSTS=your-domain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

> `DJANGO_CSRF_TRUSTED_ORIGINS` **must** include your `https://` domain or admin
> login will fail with a CSRF error once you're behind Cloudflare.

The browser calls the API at the **same origin** (`/api`), so no frontend rebuild
is needed when the domain changes.

## PostgreSQL — what changed

All DB connections now point at the `db` service. Django owns the schema; FastAPI
and the bot read/write the same tables:

- **Django** (`backend/backend/settings.py`) — uses `POSTGRES_*` env when present,
  driver `psycopg[binary]`. Falls back to SQLite only if `POSTGRES_DB` is unset.
- **FastAPI** (`website_backend`) — `DATABASE_URL=postgresql+psycopg2://…@db/…`.
- **Bot** (`bot`) — `DATABASE_URL=postgresql+asyncpg://…@db/…`.

### Migrating existing SQLite data (optional)

The move to Postgres starts with an empty DB. To bring the old data over:

```bash
# 1) From the OLD sqlite setup, dump the app data:
python backend/manage.py dumpdata --natural-primary --natural-foreign \
  -e contenttypes -e auth.permission --indent 2 > dump.json

# 2) With Postgres up and migrated, load it into the admin container:
docker compose cp dump.json migrate:/app/dump.json
docker compose run --rm migrate python manage.py loaddata /app/dump.json
```

Uploaded files already persist: `./backend/media` is bind-mounted into the
containers, so existing images/videos keep working.

## Notes

- Only `nginx` is published to the host (`:80`). Everything else talks over the
  internal Docker network. Uncomment the `db` port mapping in `docker-compose.yml`
  if you need to reach Postgres from the host.
- The frontend uses Next.js **standalone** output. If a build ever fails on
  standalone tracing, drop `output: "standalone"` from `frontend/next.config.ts`
  and change the runner stage to `npm run start` with full `node_modules`.
