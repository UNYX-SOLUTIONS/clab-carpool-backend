# CLAB Carpool Backend

Backend para aplicación de carpooling universitario con verificación institucional.

## Stack tecnológico

- **Runtime:** Node.js v18+
- **Lenguaje:** TypeScript v5+
- **Framework:** Express.js v4+
- **ORM:** Prisma v5+
- **Base de datos:** PostgreSQL v14+
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer
- **Validación:** Zod
- **Documentación:** Swagger/OpenAPI
- **Logging:** Winston

## Arquitectura

El proyecto sigue **Clean Architecture** con las capas:

```
presentation (controllers) → application (use cases) → domain (entities) ← infrastructure (repositories)
```

- **Domain** es la capa más interna: entidades, value objects, excepciones e interfaces de repositorios. No depende de nada externo.
- **Application** contiene la lógica de negocio en use cases con el patrón **Result** (sin try/catch).
- **Infrastructure** implementa repositorios con Prisma y servicios externos (email, JWT, bcrypt).
- **Presentation** expone controllers Express con validación Zod.

Ver [docs/architecture.md](docs/architecture.md) para el detalle completo.

## Requisitos previos

- Docker (recomendado) o Node.js >= 18 con pnpm
- PostgreSQL 14+ (solo si no usas la Opción A)

## Instalación

### Opción A — Todo con Docker (1 comando, recomendada)

Requiere Docker instalado. Levanta PostgreSQL, ejecuta migraciones, siembra
datos de prueba y arranca la API:

```bash
docker compose up -d
```

- **API:** `http://localhost:4000/api/v1`
- **Swagger:** `http://localhost:4000/api-docs`
- **Health check:** `GET http://localhost:4000/api/v1/health`

El seed es seguro: si ya hay datos, no los sobrescribe al reiniciar.

### Opción B — Local (PostgreSQL propio)

```bash
# 1. Instalar dependencias y configurar entorno
pnpm install
cp .env.example .env

# 2. Levantar solo PostgreSQL con Docker (o usa tu propio servidor)
docker compose up -d postgres

# 3. Un solo comando: genera el cliente Prisma, ejecuta migraciones y siembra datos
pnpm setup

# 4. Arrancar en desarrollo (hot reload)
pnpm dev
```

## Ejecución

```bash
# Desarrollo (con hot reload)
pnpm dev

# Producción
pnpm build
pnpm start
```

- **API:** `http://localhost:3000/api/v1`
- **Swagger:** `http://localhost:3000/api-docs`
- **Health check:** `GET http://localhost:3000/api/v1/health`

## Usuarios de prueba (seed)

| Rol | Correo | Contraseña |
|---|---|---|
| Conductor | carlos.perez@espol.edu.ec | Password1! |
| Pasajero | ana.torres@espol.edu.ec | Password1! |
| Pasajero | luis.gomez@ug.edu.ec | Password1! |
| Sin verificar | maria.ramirez@espol.edu.ec | Password1! |

## Autenticación

- Login con correo institucional + contraseña → devuelve `accessToken` (7d) y `refreshToken` (30d).
- Solo se puede iniciar sesión con cuentas **verificadas**.
- El registro valida que el dominio del correo coincida con una institución activa y envía un **código de verificación de 6 dígitos** (JWT firmado, expira en 10 minutos).
- Rate limiting: 5 intentos de login por IP/15 min, 3 verificaciones por IP/15 min.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor en modo desarrollo |
| `pnpm setup` | Genera Prisma + migraciones + seed (1 paso) |
| `pnpm build` | Compilar TypeScript |
| `pnpm start` | Ejecutar en producción |
| `pnpm test` | Ejecutar pruebas unitarias |
| `pnpm test:coverage` | Pruebas con cobertura (mín. 80%) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm db:generate` | Generar cliente Prisma |
| `pnpm db:migrate` | Ejecutar migraciones |
| `pnpm db:deploy` | Aplicar migraciones en producción |
| `pnpm db:seed` | Sembrar datos de prueba |
| `pnpm db:studio` | Abrir Prisma Studio |

## Pruebas

```bash
pnpm test
```

Pruebas unitarias de los use cases principales con mocks de repositorios (Jest + ts-jest).

## Docker

```bash
# Todo en uno: PostgreSQL + migraciones + seed + API
docker compose up -d

# Solo PostgreSQL (para desarrollo local)
docker compose up -d postgres
```

## Variables de entorno principales

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para access tokens |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens |
| `SMTP_HOST/PORT/USER/PASS` | Configuración SMTP |
| `EMAIL_FROM` | Remitente de correos |
| `FRONTEND_URL` | URL del frontend (CORS) |

## Colección Postman

Importa [postman/CLAB-Carpool.postman_collection.json](postman/CLAB-Carpool.postman_collection.json) para probar todos los endpoints.



