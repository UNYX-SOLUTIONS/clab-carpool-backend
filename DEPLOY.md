# Despliegue de CLAB Carpool API en el VPS de UNYX

Este overlay usa el Traefik existente y levanta un contenedor/servidor PostgreSQL independiente llamado `clab-carpool-postgres-server`, dedicado a la base de datos de CLAB. No reutiliza el PostgreSQL de UNYX. Publica únicamente la API por HTTPS; PostgreSQL queda accesible desde pgAdmin mediante la red `unyx-db-admin`, sin publicar `5432` en el VPS. También crea `clab-carpool-app` para que el futuro frontend y backend puedan comunicarse; PostgreSQL no se conecta a esa red. La API escucha en el puerto interno `3000`; el health check es `/api/v1/health`.

## Integración en el repositorio

Copiar `docker-compose.prod.yml`, `.env.production.example` y `deploy.sh` a la raíz del repositorio. Añadir `.env.production` y `backups/` al `.gitignore`. El script requiere `docker compose`, `git`, `curl` y `openssl` en el VPS.

## Preparación en el VPS

1. Clonar el repositorio bajo `/docker`, por ejemplo `/docker/clab-carpool-backend`.
2. Copiar los archivos de despliegue a la raíz del checkout.
3. Comprobar que existan las redes externas `unyx-workspace-front` y `unyx-db-admin` con `docker network ls`; el Compose de referencia de UNYX usa la primera para Traefik y la segunda para pgAdmin. El script crea `clab-carpool-app` si aún no existe.
4. El registro DNS compartido para `clabback.unyxsolutions.com` apunta a `2.25.110.67` (TTL 14 400). Confirmar que esa sea la IP pública vigente del VPS donde está Traefik antes del deploy.
5. Ejecutar `chmod +x deploy.sh` y `./deploy.sh`. La primera ejecución crea `.env.production` y termina para que completes el subdominio, la red, el dominio del frontend (`FRONTEND_URL` y `CORS_ORIGIN`) y SMTP. En la siguiente ejecución se generan los secretos que tengan el marcador `GENERATE_ON_SERVER`.

La cuenta SMTP vacía permite arrancar, pero el envío de verificación por correo no funcionará hasta configurar `SMTP_USER` y `SMTP_PASS`.

## Qué hace `deploy.sh`

- Actualiza el checkout con `git pull --ff-only` si se ejecuta dentro de un repositorio limpio.
- Valida Compose y comprueba que exista la red externa de Traefik.
- Se detiene si detecta los contenedores heredados `clab_carpool_postgres` o `clab_carpool_api`, para no crear otra base de datos sin revisar qué volumen contiene los datos actuales.
- Construye la imagen, levanta PostgreSQL y espera a que responda.
- Guarda un dump PostgreSQL antes de migrar, conserva 14 días y ejecuta `prisma migrate deploy`.
- Levanta la API y valida `https://<CLAB_API_HOST>/api/v1/health`.
- Conecta PostgreSQL a `unyx-db-admin` usando el alias DNS `clab-carpool-postgres`, sin publicar el puerto 5432 en el VPS.

No ejecuta `prisma/seed.ts`: ese seed crea usuarios de demostración con credenciales conocidas. No usarlo en producción.

## Diferencia respecto al Compose original

El Compose original del proyecto publica `5432` y `4000` en el host y ejecuta el seed de prueba al iniciar la API. Este overlay no publica puertos, requiere contraseña PostgreSQL y separa migraciones del proceso web. No ejecutar ambos Compose sobre el mismo servicio/base de datos sin revisar primero los contenedores y volúmenes existentes en el VPS.

No borrar volúmenes con `docker compose down -v`. Los respaldos se guardan en `backups/`; para restaurar, detener la API y seguir el procedimiento de restauración PostgreSQL correspondiente.

## Verificación manual

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
curl -fsS https://<CLAB_API_HOST>/api/v1/health
```

Swagger estará en `https://<CLAB_API_HOST>/api-docs`.

## Registrar PostgreSQL de CLAB en pgAdmin

Desde pgAdmin, registra el nuevo servidor PostgreSQL de CLAB (esto crea la conexión en pgAdmin; el servidor y su base se levantan automáticamente con el Compose). Usa estos datos:

| Campo | Valor |
|---|---|
| Host name/address | `clab-carpool-postgres` |
| Port | `5432` |
| Maintenance database | `clab_carpool` |
| Username | `clab` |
| Password | Valor de `POSTGRES_PASSWORD` en `.env.production` |

La contraseña se consulta dentro del archivo del VPS; nunca se publica en el repositorio. La conexión funciona porque el contenedor de pgAdmin y PostgreSQL están en `unyx-db-admin`.

Este contenedor es otra instancia de PostgreSQL, separada del servidor PostgreSQL de UNYX. Dentro de esa instancia se crea la base `clab_carpool`; desde pgAdmin se verá como un nuevo servidor y, al expandirlo, aparecerá la base de CLAB.

## Conectar el futuro frontend

En el Compose del frontend, adjuntar el servicio a la red externa `clab-carpool-app` y a `unyx-workspace-front` para que Traefik pueda enrutarlo. El API estará disponible dentro de esa red como `http://api:3000`; para llamadas desde el navegador usar `https://clabback.unyxsolutions.com/api/v1` como URL pública.
