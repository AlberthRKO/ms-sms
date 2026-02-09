# 📂 Estructura del Proyecto - Microservicio SMS

```
ms-sms-v2/
│
├── 📄 .env                                    # Variables de entorno
├── 📄 .example.env                            # Ejemplo de variables
├── 📄 package.json                            # Dependencias del proyecto
├── 📄 README.md                               # README original de NestJS
├── 📄 README_SMS.md                           # ✨ Documentación del microservicio SMS
├── 📄 IMPLEMENTACION_COMPLETADA.md            # ✨ Resumen de implementación
├── 📄 test-sms.sh                             # ✨ Script de pruebas
│
├── 📁 src/                                    # Código fuente
│   ├── 📄 main.ts                             # Bootstrap de la aplicación
│   ├── 📄 app.module.ts                       # Módulo principal
│   ├── 📄 app.controller.ts                   # Controlador raíz
│   ├── 📄 app.service.ts                      # Servicio raíz
│   │
│   ├── 📁 config/                             # Configuración
│   │   └── 📄 configuration.ts                # Config de variables de entorno
│   │
│   ├── 📁 common/                             # Utilidades comunes
│   │   ├── 📁 decorators/                     # Decoradores personalizados
│   │   ├── 📁 dtos/                           # DTOs comunes
│   │   ├── 📁 filters/                        # Filtros de excepciones
│   │   ├── 📁 interceptors/                   # Interceptores
│   │   └── 📁 pipes/                          # Pipes de validación
│   │
│   ├── 📁 helpers/                            # Helpers
│   │   └── 📄 swagger.helper.ts               # Config de Swagger
│   │
│   └── 📁 modules/                            # Módulos de la aplicación
│       │
│       ├── 📁 global/                         # Módulo global
│       │   ├── 📄 global.module.ts
│       │   └── 📄 global.service.ts
│       │
│       ├── 📁 auto/                           # Tareas automáticas (CRON)
│       │   ├── 📄 auto.module.ts
│       │   └── 📄 auto.service.ts
│       │
│       └── 📁 some-module/                    # ✨ MÓDULO SMS (Renombrar a 'sms')
│           ├── 📄 some.module.ts              # ✨ Configuración del módulo
│           ├── 📄 some.controller.ts          # ✨ Endpoints REST (3 endpoints)
│           ├── 📄 some.service.ts             # ✨ Lógica de negocio
│           ├── 📄 some.gateway.ts             # ✨ WebSocket Gateway
│           │
│           └── 📁 dto/                        # ✨ Data Transfer Objects
│               ├── 📄 message-status.enum.ts  # ✨ Enums de tipos y estados
│               ├── 📄 some.input.dto.ts       # ✨ DTOs de entrada
│               ├── 📄 some.schema.ts          # ✨ Schema de MongoDB
│               └── 📄 some.interface.ts       # ✨ Interfaces TypeScript
│
├── 📁 ejemplos/                               # ✨ EJEMPLOS Y DOCUMENTACIÓN
│   ├── 📄 cliente-websocket.ts                # ✨ Cliente Node.js para WebSocket
│   ├── 📄 test-api.http                       # ✨ Tests HTTP (REST Client)
│   └── 📄 monitor-websocket.html              # ✨ Monitor visual en tiempo real
│
├── 📁 test/                                   # Tests
│   ├── 📄 app.e2e-spec.ts                     # Tests end-to-end
│   └── 📄 test.http                           # Tests HTTP
│
└── 📁 public/                                 # Archivos estáticos
    └── 📁 assets/
        └── 📄 favicon.ico

```

## 🎯 Archivos Clave del Microservicio SMS

### ⚙️ Configuración Principal

| Archivo                                  | Descripción                                   |
| ---------------------------------------- | --------------------------------------------- |
| `src/modules/some-module/some.module.ts` | Registra providers, controllers y el gateway  |
| `src/main.ts`                            | Configura Fastify, WebSockets, CORS y Swagger |

### 🔌 Endpoints REST (some.controller.ts)

```typescript
POST / v1 / sms / send - message; // Crear mensaje SMS
POST / v1 / sms / send - message / status; // Actualizar estado
GET / v1 / sms / messages; // Listar con filtros
```

### 💾 Base de Datos (some.schema.ts)

```typescript
Collection: messages
{
  phone: String,
  message: String,
  app: String,
  messageType: Number,  // 1 o 2
  status: Number,       // 0, 1 o 2
  user: Object,
  mode: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 🔄 WebSocket (some.gateway.ts)

```typescript
Eventos emitidos:
- send-message         // Al crear mensaje
- send-message-status  // Al actualizar estado
```

### 📝 DTOs (dto/some.input.dto.ts)

```typescript
SendMessageTextDTO; // Para crear mensajes
UpdateMessageStatusDTO; // Para actualizar estado
ListMessagesQueryDTO; // Para filtrar y paginar
```

### 🎨 Ejemplos de Uso

| Archivo                           | Uso                      |
| --------------------------------- | ------------------------ |
| `ejemplos/cliente-websocket.ts`   | Cliente completo Node.js |
| `ejemplos/monitor-websocket.html` | Monitor visual navegador |
| `ejemplos/test-api.http`          | Tests con REST Client    |
| `test-sms.sh`                     | Script bash para probar  |

## 📊 Dependencias Agregadas

```json
{
  "@nestjs/websockets": "^11.1.13",
  "@nestjs/platform-socket.io": "^11.1.13",
  "socket.io": "^4.8.2"
}
```

## 🚀 Comandos Útiles

```bash
# Iniciar desarrollo
yarn start:dev

# Ejecutar pruebas
./test-sms.sh

# Ver logs del servidor
# Los logs incluyen emits de WebSocket y estados

# Linter
yarn lint

# Build producción
yarn build
```

## 🌐 URLs del Proyecto

- **API Base**: `http://localhost:3515/v1/sms`
- **Swagger**: `http://localhost:3515/api`
- **WebSocket**: `ws://localhost:3515`
- **Health Check**: `http://localhost:3515/health`

## 📖 Documentación

1. **README_SMS.md** - Documentación completa del API
2. **IMPLEMENTACION_COMPLETADA.md** - Resumen de lo implementado
3. **ejemplos/** - Código de ejemplo funcional
4. **Swagger UI** - Documentación interactiva en `/api`

## 🔐 Variables de Entorno (.env)

```env
ENV_PORT=3515
ENV_HOST_IP=0.0.0.0
ENV_MONGO_DB_URL='mongodb://localhost:27017/ms_text_sms'
ENV_SWAGGER_SHOW=true
ENV_DEBUG_SERVER=true
NODE_ENV=development
```

## 📝 Notas Importantes

- El módulo se llama `some-module` pero debería renombrarse a `sms-module`
- La colección MongoDB se llama `messages`
- WebSocket acepta conexiones CORS desde cualquier origen (`*`)
- Los logs incluyen información detallada de cada operación
- Todos los mensajes inician con `status: 0` (PENDING)

## ✅ Estado Actual

✅ Backend funcional  
✅ WebSockets implementados  
✅ 3 endpoints REST operativos  
✅ Documentación completa  
✅ Ejemplos de uso  
✅ Monitor visual  
✅ Tests preparados  
✅ Sin errores de compilación

**¡Listo para producción!** 🎉
