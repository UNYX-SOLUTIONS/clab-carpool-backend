export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CLAB Carpool API',
    version: '1.0.0',
    description:
      'API para aplicación de carpooling universitario con verificación institucional',
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'string' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'fullName', 'institutionId'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          fullName: { type: 'string' },
          institutionId: { type: 'string' },
        },
      },
      VerifyEmailRequest: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      CreateTravelRequest: {
        type: 'object',
        required: [
          'origin',
          'destination',
          'departureTime',
          'availableSeats',
          'pricePerSeat',
          'vehicleId',
        ],
        properties: {
          origin: { type: 'string' },
          destination: { type: 'string' },
          departureTime: { type: 'string', format: 'date-time' },
          availableSeats: { type: 'integer', minimum: 1 },
          pricePerSeat: { type: 'number', minimum: 0 },
          vehicleId: { type: 'string' },
        },
      },
      RequestTravel: {
        type: 'object',
        required: ['travelId'],
        properties: {
          travelId: { type: 'string' },
        },
      },
      UpdateTravelStatus: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'in_progress', 'completed', 'cancelled'],
          },
        },
      },
      SendMessage: {
        type: 'object',
        required: ['chatId', 'content'],
        properties: {
          chatId: { type: 'string' },
          content: { type: 'string', maxLength: 2000 },
        },
      },
      RateTrip: {
        type: 'object',
        required: ['travelId', 'score'],
        properties: {
          travelId: { type: 'string' },
          score: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
        },
      },
      Recharge: {
        type: 'object',
        required: ['amount', 'paymentMethod'],
        properties: {
          amount: { type: 'number', minimum: 0.01 },
          paymentMethod: { type: 'string' },
        },
      },
      RegisterVehicle: {
        type: 'object',
        required: ['brand', 'model', 'plate', 'color', 'seats'],
        properties: {
          brand: { type: 'string' },
          model: { type: 'string' },
          plate: { type: 'string', example: 'ABC-123' },
          color: { type: 'string' },
          seats: { type: 'integer', minimum: 1, maximum: 10 },
        },
      },
      UpdateProfile: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          phone: { type: 'string' },
          photoUrl: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Autenticación y verificación' },
    { name: 'Users', description: 'Gestión de usuarios' },
    { name: 'Travels', description: 'Viajes y solicitudes' },
    { name: 'Chats', description: 'Chat interno y PIN de validación' },
    { name: 'Ratings', description: 'Calificaciones' },
    { name: 'Wallet', description: 'Monedero y transacciones' },
    { name: 'Vehicles', description: 'Vehículos de conductores' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Auth'],
        summary: 'Health check',
        security: [],
        responses: {
          200: { description: 'API operativa' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          200: { description: 'Login correcto con tokens' },
          401: { description: 'Credenciales inválidas' },
          403: { description: 'Usuario no verificado' },
          429: { description: 'Demasiados intentos' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Usuario registrado, código enviado' },
          409: { description: 'Correo ya registrado' },
          403: { description: 'Dominio institucional inválido' },
        },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verificar código de email',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyEmailRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Correo verificado' },
          400: { description: 'Código inválido o expirado' },
          429: { description: 'Demasiados intentos' },
        },
      },
    },
    '/auth/resend-code': {
      post: {
        tags: ['Auth'],
        summary: 'Reenviar código de verificación',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Código reenviado' },
          404: { description: 'Usuario no encontrado' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        responses: {
          200: { description: 'Sesión cerrada' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refrescar token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Nuevos tokens generados' },
          401: { description: 'Token inválido o expirado' },
        },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Obtener perfil del usuario autenticado',
        responses: { 200: { description: 'Perfil del usuario' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar perfil',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfile' },
            },
          },
        },
        responses: { 200: { description: 'Perfil actualizado' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Usuario encontrado' },
          404: { description: 'Usuario no encontrado' },
        },
      },
    },
    '/users/verify-institution': {
      post: {
        tags: ['Users'],
        summary: 'Verificar dominio institucional',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Institución verificada' },
          403: { description: 'Dominio no verificado' },
        },
      },
    },
    '/travels': {
      get: {
        tags: ['Travels'],
        summary: 'Listar viajes disponibles con filtros',
        parameters: [
          { name: 'origin', in: 'query', schema: { type: 'string' } },
          { name: 'destination', in: 'query', schema: { type: 'string' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string' } },
          { name: 'minSeats', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        ],
        responses: { 200: { description: 'Lista de viajes disponibles' } },
      },
      post: {
        tags: ['Travels'],
        summary: 'Crear viaje (conductor)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTravelRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Viaje creado' },
          403: { description: 'Solo conductores' },
        },
      },
    },
    '/travels/my-travels': {
      get: {
        tags: ['Travels'],
        summary: 'Obtener viajes del usuario',
        responses: { 200: { description: 'Viajes como conductor y pasajero' } },
      },
    },
    '/travels/{id}': {
      get: {
        tags: ['Travels'],
        summary: 'Obtener detalle de viaje',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Viaje encontrado' },
          404: { description: 'Viaje no encontrado' },
        },
      },
      delete: {
        tags: ['Travels'],
        summary: 'Cancelar viaje (conductor)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Viaje cancelado' } },
      },
    },
    '/travels/{id}/request': {
      post: {
        tags: ['Travels'],
        summary: 'Solicitar viaje (pasajero)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RequestTravel' },
            },
          },
        },
        responses: {
          201: { description: 'Solicitud enviada' },
          409: { description: 'Viaje completo o ya solicitado' },
        },
      },
    },
    '/travels/{id}/status': {
      put: {
        tags: ['Travels'],
        summary: 'Actualizar estado del viaje (conductor)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTravelStatus' },
            },
          },
        },
        responses: { 200: { description: 'Estado actualizado' } },
      },
    },
    '/chats': {
      get: {
        tags: ['Chats'],
        summary: 'Listar chats del usuario',
        responses: { 200: { description: 'Lista de chats' } },
      },
    },
    '/chats/active': {
      get: {
        tags: ['Chats'],
        summary: 'Obtener chat activo de viaje',
        parameters: [
          {
            name: 'travelId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Chat activo' },
          404: { description: 'Chat no encontrado' },
        },
      },
    },
    '/chats/{id}/messages': {
      get: {
        tags: ['Chats'],
        summary: 'Obtener mensajes de un chat',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Mensajes del chat' } },
      },
      post: {
        tags: ['Chats'],
        summary: 'Enviar mensaje',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendMessage' },
            },
          },
        },
        responses: { 201: { description: 'Mensaje enviado' } },
      },
    },
    '/chats/{id}/pin-request': {
      post: {
        tags: ['Chats'],
        summary: 'Solicitar PIN de validación (conductor)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          201: { description: 'PIN generado' },
          403: { description: 'Solo conductores' },
        },
      },
    },
    '/ratings': {
      post: {
        tags: ['Ratings'],
        summary: 'Calificar viaje',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RateTrip' },
            },
          },
        },
        responses: {
          201: { description: 'Calificación registrada' },
          409: { description: 'Viaje ya calificado' },
        },
      },
    },
    '/ratings/user/{userId}': {
      get: {
        tags: ['Ratings'],
        summary: 'Obtener calificaciones de un usuario',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { 200: { description: 'Calificaciones y promedio' } },
      },
    },
    '/wallet': {
      get: {
        tags: ['Wallet'],
        summary: 'Obtener saldo del monedero',
        responses: { 200: { description: 'Saldo del monedero' } },
      },
    },
    '/wallet/recharge': {
      post: {
        tags: ['Wallet'],
        summary: 'Recargar saldo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Recharge' },
            },
          },
        },
        responses: { 200: { description: 'Saldo recargado' } },
      },
    },
    '/wallet/transactions': {
      get: {
        tags: ['Wallet'],
        summary: 'Obtener historial de transacciones',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Lista de transacciones' } },
      },
    },
    '/vehicles': {
      post: {
        tags: ['Vehicles'],
        summary: 'Registrar vehículo (conductor)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterVehicle' },
            },
          },
        },
        responses: {
          201: { description: 'Vehículo registrado' },
          403: { description: 'Solo conductores' },
          409: { description: 'Vehículo o placa ya registrados' },
        },
      },
    },
    '/vehicles/my-vehicle': {
      get: {
        tags: ['Vehicles'],
        summary: 'Obtener vehículo del conductor',
        responses: {
          200: { description: 'Vehículo del conductor' },
          404: { description: 'Vehículo no encontrado' },
        },
      },
    },
    '/vehicles/{id}': {
      put: {
        tags: ['Vehicles'],
        summary: 'Actualizar vehículo',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterVehicle' },
            },
          },
        },
        responses: { 200: { description: 'Vehículo actualizado' } },
      },
    },
  },
};
