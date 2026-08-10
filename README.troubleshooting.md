# Troubleshooting

## `docker compose up --build` fails while building the backend

The Rails image now installs the native packages required by bundled gems, including YAML headers used by `psych`.

If you still see old build output, rebuild without cache:

```bash
docker compose build --no-cache backend
docker compose up
```

## The app starts, but the data looks wrong or API requests fail

Older versions of this repo initialized MySQL with SQL that did not match the Rails schema. Clear the Docker volumes and let Rails rebuild the database:

```bash
docker compose down -v
docker compose up --build
```

## The frontend cannot reach the backend

Check that:

```bash
docker compose ps
docker compose logs backend
```

The frontend expects the API at:

```text
http://localhost:3000/api
```

If the frontend exits with a Rollup optional dependency error, restart it so the container can repopulate `node_modules` inside Docker:

```bash
docker compose up -d frontend
docker compose logs -f frontend
```

## I want a clean sample dataset again

Reset the containers and volumes:

```bash
docker compose down -v
docker compose up --build
```
