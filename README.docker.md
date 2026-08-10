# Docker Setup Guide

This project ships with a three-container development stack:

- `frontend`: Vite + React app on `http://localhost:5173`
- `backend`: Rails API on `http://localhost:3000/api`
- `db`: MySQL 8 on `localhost:3306`

## Prerequisites

- Docker Desktop with Docker Compose enabled

## Start the stack

```bash
docker compose up --build
```

The backend container will automatically:

1. wait for MySQL to become healthy
2. run `db:prepare`
3. run `db:seed`
4. start Rails on port `3000`

The frontend container uses a Debian-based Node image and installs container-native dependencies into its Docker volume before starting Vite. This avoids Linux binary mismatches from host-installed `node_modules`.

The seed process is now idempotent:

- categories are created if missing
- sample expenses are only generated when the database is empty
- restarting containers will not wipe your existing data

## Run in the background

```bash
docker compose up --build -d
```

## Stop the stack

```bash
docker compose down
```

## Reset everything

If you started the project before these Docker fixes, your MySQL volume may still contain the old broken schema from `db/init.sql`.

To rebuild from a clean state:

```bash
docker compose down -v
docker compose up --build
```

## Useful commands

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose exec backend ./bin/rails console
docker compose exec backend ./bin/rails db:migrate
docker compose exec backend env RAILS_ENV=test bundle exec rspec
docker compose exec frontend npm run build
```

## Notes

- The frontend now reads `VITE_API_URL`, which is set to `http://localhost:3000/api` in Docker.
- The MySQL init script now creates databases only. Rails owns the schema through migrations.
