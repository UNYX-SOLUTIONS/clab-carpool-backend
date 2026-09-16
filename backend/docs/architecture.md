# Arquitectura — CLAB Carpool Backend

## Visión general

El backend implementa **Clean Architecture** (Arquitectura Limpia) con una regla de dependencia estricta:

```
          ┌─────────────────────────────────────────┐
          │              PRESENTATION               │
          │  Controllers · Middlewares · Rutas      │
          │  Validators (Zod) · Swagger             │
          └──────────────────┬──────────────────────┘
                             │ usa
          ┌──────────────────▼──────────────────────┐
          │              APPLICATION               │
          │  Use Cases · DTOs · Interfaces          │
          │  (Result Pattern, sin try/catch)        │
          └──────────────────┬──────────────────────┘
                             │ usa
          ┌──────────────────▼──────────────────────┐
          │                DOMAIN                   │
          │  Entities · Value Objects · Exceptions  │
          │  Repository Interfaces                  │
          └──────────────────▲──────────────────────┘
                             │ implementa
          ┌──────────────────┴──────────────────────┐
          │             INFRASTRUCTURE              │
          │  Prisma Repositories · Services         │
          │  (Email, JWT, Bcrypt, PIN) · Config     │
          └─────────────────────────────────────────┘
```

**Regla de dependencia:** las dependencias apuntan hacia adentro.
`Infrastructure → Application → Domain`. Domain es la capa más interna y no
depende de nada externo (frameworks, base de datos, HTTP).

## Capas

### 1. Domain (`src/domain`)

- **Entities:** `User`, `Travel`, `TravelRequest`, `Vehicle`, `Institution`,
  `Chat`, `Message`, `Rating`, `Wallet`, `Transaction`, `PinValidation`.
  Contienen las reglas de dominio (validación de asientos, score 1-5, etc.).
- **Value Objects:** `Email` (dominio institucional), `PhoneNumber`,
  `PlateNumber`, `Coordinates`, `Money` (previene errores de precisión con
  montos, redondeo a 2 decimales).
- **Exceptions:** jerarquía `DomainException` (UsuarioNoEncontrado,
  CredencialesInválidas, DominioInstitucionalInválido, ViajeCompleto, etc.).
- **Repositories:** interfaces `I*Repository` que definen los contratos de
  persistencia sin acoplarse a Prisma.

### 2. Application (`src/application`)

- **Use Cases:** 29 casos de uso organizados por dominio (auth, user, travel,
  chat, rating, wallet, vehicle). Cada uno recibe sus dependencias por
  **inyección de dependencias manual** (constructor).
- **DTOs:** objetos de transferencia de datos tipados.
- **Interfaces:** contratos para servicios externos (`IAuthService`,
  `IEmailService`, `IJwtService`, `IEncryptionService`, `IPinGenerator`).
- **Result Pattern:** los use cases retornan `Result<T>` (éxito o error con
  `AppError`), eliminando try/catch de lógica de negocio.

### 3. Infrastructure (`src/infrastructure`)

- **Repositories:** implementaciones `Prisma*Repository` de las interfaces del
  dominio. Usan `include`/`select` para prevenir N+1 queries.
- **Services:** `NodemailerService` (códigos de verificación y PINs),
  `JwtService` + `AuthService` (tokens de acceso 7d y refresh 30d),
  `BcryptService` (bcrypt, 12 salt rounds), `PinGenerator` (PIN 6 dígitos).
- **Config:** `env.ts` valida variables de entorno con Zod al arrancar.
- **Container:** composición raíz de dependencias (`buildContainer()`).

### 4. Presentation (`src/presentation`)

- **Controllers:** exponen los endpoints y delegan a use cases.
- **Middlewares:** autenticación JWT, validación Zod, manejo global de
  errores, verificación de institución, verificación de rol y rate limiting
  en memoria.
- **Routes:** montadas bajo `/api/v1`.
- **Swagger:** documentación OpenAPI servida en `/api-docs`.

## Flujo de una petición

```
HTTP Request
  → Middleware auth (verifica JWT → req.user)
  → Middleware validation (Zod → body validado)
  → Middleware role/institution (reglas de acceso)
  → Controller (extrae datos, llama use case)
  → Use Case (lógica de negocio, Result)
  → Repository (Prisma → PostgreSQL)
  → Controller → responseHandler → HTTP Response
```

## Decisiones clave

- **Monedero:** `PrismaWalletRepository.recharge()` usa `prisma.$transaction`
  para actualizar saldo + crear transacción de forma atómica.
- **Montos:** almacenados como `Decimal` en PostgreSQL; convertidos a `number`
  con `Money` value object en el dominio.
- **Soft delete:** viajes cancelados usan `isActive = false` (no se borran).
- **Fechas:** ISO-8601 en toda la API.
- **XSS:** el contenido de mensajes se sanitiza en `SendMessageUseCase`.
- **SQL injection:** prevenida por Prisma (queries parametrizadas).
- **Verificación de correo:** código de 6 dígitos firmado como JWT con
  expiración de 10 minutos (sin estado en BD).

## Seguridad

- Passwords: bcrypt con 12 salt rounds; reglas de complejidad en Zod.
- JWT: access token 7d + refresh token 30d con secretos separados.
- Rate limiting: 5 login/15min por IP, 3 verificación/15min por IP.
- Helmet (headers de seguridad), CORS configurable, límite de body 1mb.
- Acceso exclusivo con correo institucional verificado (allowlist de dominios).
