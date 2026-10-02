#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

cd "$ROOT_DIR"
 
fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

for command in docker git curl openssl; do
  command -v "$command" >/dev/null 2>&1 || fail "Falta el comando requerido: $command"
done

[[ -f "$COMPOSE_FILE" ]] || fail "No existe $COMPOSE_FILE en $ROOT_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  cp .env.production.example "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  printf 'Se creó %s. Configura CLAB_API_HOST, TRAEFIK_NETWORK y SMTP antes de volver a ejecutar el deploy.\n' "$ENV_FILE"
  exit 1
fi

make_secret_if_needed() {
  local key="$1"
  local value
  value="$(sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1)"
  if [[ "$value" == "GENERATE_ON_SERVER" || -z "$value" ]]; then
    value="$(openssl rand -hex 32)"
    if grep -q "^${key}=" "$ENV_FILE"; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
      printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
    chmod 600 "$ENV_FILE"
    printf 'Generado secreto para %s en %s.\n' "$key" "$ENV_FILE"
  fi
}

make_secret_if_needed POSTGRES_PASSWORD
make_secret_if_needed JWT_SECRET
make_secret_if_needed JWT_REFRESH_SECRET

API_HOST="$(sed -n 's/^CLAB_API_HOST=//p' "$ENV_FILE" | tail -n 1)"
TRAEFIK_NETWORK="$(sed -n 's/^TRAEFIK_NETWORK=//p' "$ENV_FILE" | tail -n 1)"
[[ "$API_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail "CLAB_API_HOST falta o no es válido en $ENV_FILE"
[[ "$API_HOST" != "api.example.com" ]] || fail "Cambia CLAB_API_HOST por el subdominio real de CLAB"
[[ "$TRAEFIK_NETWORK" =~ ^[A-Za-z0-9_.-]+$ ]] || fail "TRAEFIK_NETWORK falta o no es válido en $ENV_FILE"

docker network inspect "$TRAEFIK_NETWORK" >/dev/null 2>&1 || fail "No existe la red Docker '$TRAEFIK_NETWORK'. Revisa el nombre real con: docker network ls"
docker network inspect unyx-db-admin >/dev/null 2>&1 || fail "No existe la red compartida con pgAdmin: unyx-db-admin"
if ! docker network inspect clab-carpool-app >/dev/null 2>&1; then
  printf 'Creando red compartida para frontend/backend: clab-carpool-app\n'
  docker network create clab-carpool-app >/dev/null
fi

for legacy_container in clab_carpool_postgres clab_carpool_api; do
  if docker container inspect "$legacy_container" >/dev/null 2>&1; then
    fail "Existe el contenedor legado '$legacy_container'. Revisa sus datos/volúmenes y respáldalos antes de desplegar una instancia nueva."
  fi
done

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  [[ -z "$(git status --porcelain)" ]] || fail "El repositorio tiene cambios locales. Confirma o descarta los cambios antes del deploy."
  git pull --ff-only
fi

COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")
"${COMPOSE[@]}" config --quiet

printf 'Construyendo la imagen de CLAB...\n'
"${COMPOSE[@]}" build api

printf 'Iniciando PostgreSQL...\n'
"${COMPOSE[@]}" up -d postgres

printf 'Esperando a PostgreSQL...\n'
db_ready=false
for _ in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    db_ready=true
    break
  fi
  sleep 2
done
if [[ "$db_ready" != true ]]; then
  "${COMPOSE[@]}" logs --tail=80 postgres >&2
  fail "PostgreSQL no alcanzó estado listo"
fi

mkdir -p backups
chmod 700 backups
backup_file="backups/clab-carpool_$(date -u +%Y%m%dT%H%M%SZ).dump"
printf 'Creando respaldo previo a migraciones: %s\n' "$backup_file"
"${COMPOSE[@]}" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_file"
chmod 600 "$backup_file"
find backups -type f -name 'clab-carpool_*.dump' -mtime "+$BACKUP_RETENTION_DAYS" -delete

printf 'Aplicando migraciones Prisma...\n'
"${COMPOSE[@]}" run --rm --no-deps migrate

printf 'Iniciando API detrás de Traefik...\n'
"${COMPOSE[@]}" up -d api

printf 'Comprobando endpoint https://%s/api/v1/health ...\n' "$API_HOST"
curl --fail --silent --show-error --connect-timeout 5 \
  --retry 12 --retry-delay 5 --retry-connrefused \
  "https://${API_HOST}/api/v1/health" || {
    "${COMPOSE[@]}" ps
    "${COMPOSE[@]}" logs --tail=100 api >&2
    fail "La API está levantada, pero el health check HTTPS por Traefik falló"
  }

printf '\nDeploy terminado.\n'
printf 'API: https://%s/api/v1\nSwagger: https://%s/api-docs\n' "$API_HOST" "$API_HOST"
"${COMPOSE[@]}" ps
