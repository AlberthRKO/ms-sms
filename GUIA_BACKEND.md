# 📘 Guía Backend - Microservicio SMS v2

## 📋 Índice

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Servicios Disponibles (Endpoints)](#servicios-disponibles-endpoints)
5. [DTOs y su Significado](#dtos-y-su-significado)
6. [Eventos WebSocket](#eventos-websocket)
7. [Estructura de MongoDB](#estructura-de-mongodb)
8. [Flujo de Comunicación](#flujo-de-comunicación)
9. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Descripción del Proyecto

**ms-sms-v2** es un microservicio desarrollado en NestJS para la gestión y envío de mensajes SMS. El sistema permite:

- ✅ Crear y almacenar mensajes SMS
- ✅ Comunicación en tiempo real mediante WebSockets
- ✅ Gestión de estados de mensajes (pendiente, enviado, fallido)
- ✅ Agrupación de mensajes por chat (teléfono + aplicación)
- ✅ Consulta de historial de mensajes con filtros y paginación
- ✅ Diferenciación entre SMS con código y mensajes informativos

El servicio actúa como intermediario:

1. Recibe solicitudes de envío de SMS
2. Almacena el mensaje en MongoDB
3. Emite eventos WebSocket para que aplicaciones externas procesen el envío
4. Actualiza el estado del mensaje según el resultado

---

## 🗂️ Estructura del Proyecto

```
ms-sms-v2/
├── src/
│   ├── main.ts                          # Punto de entrada de la aplicación
│   ├── app.module.ts                    # Módulo principal
│   ├── app.controller.ts                # Controlador principal
│   ├── app.service.ts                   # Servicio principal
│   │
│   ├── common/                          # Recursos compartidos
│   │   ├── decorators/                  # Decoradores personalizados
│   │   │   ├── interceptor.decorator.ts
│   │   │   ├── params.decorator.ts
│   │   │   └── query.decorator.ts
│   │   ├── dtos/                        # DTOs comunes
│   │   │   ├── common-params.dto.ts
│   │   │   ├── common-query.dto.ts
│   │   │   └── filters.dto.ts
│   │   ├── filters/                     # Filtros de excepción
│   │   │   └── global-exception.filter.ts
│   │   ├── interceptors/                # Interceptores
│   │   │   └── response-format.interceptor.ts
│   │   └── pipes/                       # Pipes de validación
│   │       ├── dto-validator.pipe.ts
│   │       └── param-validator.pipe.ts
│   │
│   ├── config/                          # Configuración
│   │   └── configuration.ts             # Variables de entorno
│   │
│   ├── helpers/                         # Utilidades
│   │   └── swagger.helper.ts            # Configuración de Swagger
│   │
│   └── modules/                         # Módulos funcionales
│       ├── auto/                        # Módulo de auto-registro
│       ├── global/                      # Módulo global
│       └── some-module/                 # Módulo principal SMS
│           ├── some.controller.ts       # Controlador de SMS
│           ├── some.service.ts          # Lógica de negocio SMS
│           ├── some.gateway.ts          # Gateway WebSocket
│           ├── some.module.ts           # Configuración del módulo
│           └── dto/                     # DTOs y esquemas
│               ├── message-status.enum.ts    # Enumeraciones
│               ├── some.input.dto.ts         # DTOs de entrada
│               ├── some.interface.ts         # Interfaces
│               └── some.schema.ts            # Esquema MongoDB
│
├── ejemplos/                            # Ejemplos de uso del microservicio
├── test/                                # Tests e2e
├── public/                              # Archivos estáticos
└── package.json                         # Dependencias del proyecto
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología            | Versión | Propósito                              |
| --------------------- | ------- | -------------------------------------- |
| **NestJS**            | 11.x    | Framework backend                      |
| **Fastify**           | 5.x     | Servidor HTTP (más rápido que Express) |
| **MongoDB**           | -       | Base de datos NoSQL                    |
| **Mongoose**          | 11.x    | ODM para MongoDB                       |
| **Socket.io**         | 11.x    | Comunicación WebSocket en tiempo real  |
| **class-validator**   | 0.14.x  | Validación de DTOs                     |
| **class-transformer** | 0.5.x   | Transformación de objetos              |
| **Swagger**           | 11.x    | Documentación de API                   |
| **TypeScript**        | 5.x     | Lenguaje de programación               |

---

## 🌐 Servicios Disponibles (Endpoints)

### Base URL

```
http://localhost:3515/api/v1/
```

### 1. **POST** `/sms/send-message`

Crea un nuevo mensaje SMS y emite evento WebSocket `send-message`.

**Descripción:**

- Crea un mensaje en la base de datos con estado `PENDING`
- Genera automáticamente un `chatId` único (hash MD5 de teléfono + app)
- Emite el evento `send-message` para que apps externas lo procesen
- NO emite automáticamente el evento de estado

**Request Body:**

```json
{
  "phone": "+59178945612",
  "message": "Tu código de verificación es: 123456",
  "app": "UNIA",
  "messageType": 1,
  "mode": "prod",
  "user": {
    "ci": "12345678",
    "nombreCompleto": "Juan Pérez",
    "msPersonaId": 100,
    "funcionarioId": 50,
    "institucionId": 1,
    "oficinaId": 10
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mensaje creado exitosamente",
  "data": {
    "messageId": "67a42c2a88453f4c8d5b9d0e",
    "chatId": "a1b2c3d4e5f6g7h8",
    "message": "Tu código de verificación es: 123456",
    "app": "UNIA",
    "user": { ... },
    "phone": "+59178945612",
    "mode": "prod",
    "messageType": 1,
    "status": 0,
    "createdAt": "2026-02-10T13:00:00.000Z",
    "updatedAt": "2026-02-10T13:00:00.000Z"
  }
}
```

---

### 2. **POST** `/sms/send-message/status`

Actualiza el estado de un mensaje existente y emite evento `send-message-status`.

**Descripción:**

- La app externa llama este endpoint después de enviar el SMS
- Actualiza el estado del mensaje (PENDING → SENT o FAILED)
- Emite el evento `send-message-status` para notificar el cambio

**Request Body:**

```json
{
  "messageId": "67a42c2a88453f4c8d5b9d0e",
  "status": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Estado actualizado exitosamente",
  "data": {
    "messageId": "67a42c2a88453f4c8d5b9d0e",
    "chatId": "a1b2c3d4e5f6g7h8",
    "message": "Tu código de verificación es: 123456",
    "status": 1,
    ...
  }
}
```

---

### 3. **GET** `/sms/messages`

Lista todos los mensajes con filtros opcionales y paginación.

**Query Parameters:**

- `messageType` (opcional): Filtrar por tipo (1=código, 2=informativo)
- `status` (opcional): Filtrar por estado (0=pendiente, 1=enviado, 2=fallido)
- `phone` (opcional): Filtrar por número de teléfono
- `app` (opcional): Filtrar por aplicación
- `page` (opcional, default=1): Número de página
- `limit` (opcional, default=10): Registros por página

**Ejemplo:**

```
GET /sms/messages?messageType=1&status=1&page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Mensajes obtenidos exitosamente",
  "data": [
    {
      "messageId": "67a42c2a88453f4c8d5b9d0e",
      "chatId": "a1b2c3d4e5f6g7h8",
      "message": "Tu código es: 123456",
      "status": 1,
      ...
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "size": 20
  }
}
```

---

### 4. **GET** `/sms/messages/chat/:chatId`

Obtiene todos los mensajes de un chat específico (agrupados por chatId).

**Path Parameters:**

- `chatId`: ID del chat (generado automáticamente)

**Query Parameters:**

- `page` (opcional, default=1)
- `limit` (opcional, default=50)

**Ejemplo:**

```
GET /sms/messages/chat/a1b2c3d4e5f6g7h8?page=1&limit=50
```

**Response:**

```json
{
  "success": true,
  "message": "Mensajes del chat obtenidos exitosamente",
  "data": [
    { ... },
    { ... }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "size": 50
  }
}
```

---

## 📦 DTOs y su Significado

### 1. **SendMessageTextDTO**

DTO para crear un nuevo mensaje SMS.

```typescript
{
  phone: string;          // Teléfono con código de país (+59178945612)
  message: string;        // Contenido del mensaje (máx. 4096 caracteres)
  app: string;            // Nombre de la aplicación que envía
  messageType: number;    // 1: SMS con código, 2: Mensaje informativo
  mode?: string;          // Entorno: prod, dev, test, stage (default: prod)
  user: {                 // Datos del usuario que envía
    ci: string;
    nombreCompleto: string;
    msPersonaId?: number;
    funcionarioId?: number;
    institucionId?: number;
    oficinaId?: number;
  }
}
```

**Validaciones:**

- `phone`: 8-15 dígitos, debe coincidir con formato de teléfono internacional
- `message`: Obligatorio, máximo 4096 caracteres
- `app`: Obligatorio, cadena de texto
- `messageType`: Debe ser 1 o 2
- `user.ci`: Obligatorio
- `user.nombreCompleto`: Obligatorio

---

### 2. **UpdateMessageStatusDTO**

DTO para actualizar el estado de un mensaje.

```typescript
{
  messageId: string; // ObjectId de MongoDB
  status: number; // 0: Pendiente, 1: Enviado, 2: Fallido
}
```

**Validaciones:**

- `messageId`: Debe ser un ObjectId válido de MongoDB
- `status`: Debe ser 0, 1 o 2

---

### 3. **ListMessagesQueryDTO**

DTO para buscar y filtrar mensajes.

```typescript
{
  messageType?: number;  // Filtro por tipo (1 o 2)
  status?: number;       // Filtro por estado (0, 1 o 2)
  phone?: string;        // Filtro por teléfono (búsqueda parcial)
  app?: string;          // Filtro por aplicación (búsqueda parcial)
  page?: number;         // Número de página (default: 1)
  limit?: number;        // Registros por página (default: 10)
}
```

---

### 4. **Enumeraciones**

#### MessageType

```typescript
enum MessageType {
  CODE = 1, // SMS con código de verificación
  INFO = 2, // Mensaje informativo general
}
```

#### MessageStatus

```typescript
enum MessageStatus {
  PENDING = 0, // Pendiente de envío
  SENT = 1, // Enviado correctamente
  FAILED = 2, // Falló el envío
}
```

#### ENVIRONMENT_ENUM

```typescript
enum ENVIRONMENT_ENUM {
  PROD = 'prod',
  DEV = 'dev',
  TEST = 'test',
  STAGE = 'stage',
}
```

---

## 🔌 Eventos WebSocket

El servicio utiliza **Socket.io** para comunicación en tiempo real.

### Configuración del Gateway

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
```

- **Puerto:** Mismo que el servidor HTTP (3515)
- **CORS:** Habilitado para todos los orígenes
- **Protocolo:** WebSocket con fallback a polling

---

### 1. **Evento: `send-message`**

**Emisor:** Servicio backend  
**Receptor:** Aplicación externa (Flutter, React, etc.)  
**Cuándo se emite:** Al crear un nuevo mensaje

**Payload:**

```typescript
{
  messageId: string;
  chatId: string;
  message: string;
  app: string;
  user: object;
  phone: string;
  mode: string;
  messageType: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Propósito:**
Notifica a las apps externas que hay un nuevo mensaje SMS que debe ser enviado.

**Ejemplo de escucha (Cliente):**

```javascript
socket.on('send-message', (payload) => {
  console.log('Nuevo mensaje recibido:', payload);
  // La app externa procesa y envía el SMS
  enviarSMS(payload.phone, payload.message);
});
```

---

### 2. **Evento: `send-message-status`**

**Emisor:** Servicio backend  
**Receptor:** Aplicaciones que monitorean estados  
**Cuándo se emite:** Al actualizar el estado de un mensaje

**Payload:**

```typescript
{
  messageId: string;
  chatId: string;
  message: string;
  app: string;
  user: object;
  phone: string;
  mode: string;
  messageType: number;
  status: number; // 0: Pendiente, 1: Enviado, 2: Fallido
  createdAt: Date;
  updatedAt: Date;
}
```

**Propósito:**
Notifica a los clientes conectados sobre cambios en el estado de un mensaje.

**Ejemplo de escucha (Cliente):**

```javascript
socket.on('send-message-status', (payload) => {
  console.log(`Mensaje ${payload.messageId} cambió a estado: ${payload.status}`);
  actualizarUI(payload);
});
```

---

## 🗄️ Estructura de MongoDB

### Base de Datos: `ms-sms-v2`

### Colección: `messages`

Almacena todos los mensajes SMS creados.

#### Esquema del Documento

```typescript
{
  _id: ObjectId,              // ID único generado por MongoDB
  chatId: string,             // Hash MD5 de teléfono+app (16 caracteres)
  mode: string,               // Entorno: prod, dev, test, stage
  phone: string,              // Número de teléfono con código de país
  message: string,            // Contenido del mensaje SMS
  app: string,                // Nombre de la aplicación
  user: {                     // Información del usuario
    ci: string,
    nombreCompleto: string,
    msPersonaId?: number,
    funcionarioId?: number,
    institucionId?: number,
    oficinaId?: number
  },
  messageType: number,        // 1: Código, 2: Informativo
  status: number,             // 0: Pendiente, 1: Enviado, 2: Fallido
  createdAt: Date,            // Timestamp de creación
  updatedAt: Date             // Timestamp de última actualización
}
```

#### Índices

```javascript
{
  chatId: -1,        // Índice descendente para agrupación
  phone: -1,         // Índice para búsquedas por teléfono
  app: -1,           // Índice para búsquedas por app
  messageType: -1,   // Índice para filtrado por tipo
  status: -1         // Índice para filtrado por estado
}
```

#### Ejemplo de Documento

```json
{
  "_id": "67a42c2a88453f4c8d5b9d0e",
  "chatId": "a1b2c3d4e5f6g7h8",
  "mode": "prod",
  "phone": "+59178945612",
  "message": "Tu código de verificación es: 123456",
  "app": "UNIA",
  "user": {
    "ci": "12345678",
    "nombreCompleto": "Juan Pérez",
    "msPersonaId": 100,
    "funcionarioId": 50,
    "institucionId": 1,
    "oficinaId": 10
  },
  "messageType": 1,
  "status": 0,
  "createdAt": "2026-02-10T13:00:00.000Z",
  "updatedAt": "2026-02-10T13:00:00.000Z"
}
```

---

## 🔄 Flujo de Comunicación

### Flujo Completo: Envío de SMS

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  App Web    │      │   Backend   │      │   MongoDB   │      │  App Ext.   │
│  (Cliente)  │      │   NestJS    │      │             │      │  (Flutter)  │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │                    │
       │  POST /send-message│                    │                    │
       ├───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │  Guardar mensaje   │                    │
       │                    ├───────────────────>│                    │
       │                    │                    │                    │
       │                    │  Documento creado  │                    │
       │                    │<───────────────────┤                    │
       │                    │                    │                    │
       │   Respuesta 201    │                    │                    │
       │<───────────────────┤                    │                    │
       │                    │                    │                    │
       │                    │  Emit: send-message (WebSocket)         │
       │                    ├────────────────────────────────────────>│
       │                    │                    │                    │
       │                    │                    │   App procesa y    │
       │                    │                    │   envía SMS real   │
       │                    │                    │                    │
       │                    │  POST /send-message/status              │
       │                    │<────────────────────────────────────────┤
       │                    │                    │                    │
       │                    │  Actualizar estado │                    │
       │                    ├───────────────────>│                    │
       │                    │                    │                    │
       │                    │  Estado actualizado│                    │
       │                    │<───────────────────┤                    │
       │                    │                    │                    │
       │                    │  Emit: send-message-status (WebSocket)  │
       │<───────────────────┴────────────────────┴────────────────────│
       │                                                               │
```

### Pasos Detallados

1. **Creación de Mensaje:**
   - El cliente web/app llama a `POST /sms/send-message`
   - Backend valida el DTO y crea el mensaje con estado `PENDING`
   - Se genera un `chatId` único (hash MD5 de teléfono + app)
   - El mensaje se guarda en MongoDB
   - Se retorna respuesta HTTP 201 al cliente

2. **Notificación via WebSocket:**
   - Backend emite evento `send-message` con el payload completo
   - La app externa (Flutter) escucha este evento
   - La app externa procesa el mensaje y envía el SMS real

3. **Actualización de Estado:**
   - La app externa llama a `POST /sms/send-message/status`
   - Backend actualiza el estado en MongoDB
   - Backend emite evento `send-message-status`
   - Todos los clientes conectados reciben la actualización

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Enviar SMS con Código

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+59178945612",
    "message": "Tu código de verificación es: 785412",
    "app": "UNIA",
    "messageType": 1,
    "mode": "prod",
    "user": {
      "ci": "12345678",
      "nombreCompleto": "Juan Pérez"
    }
  }'
```

### Ejemplo 2: Enviar Mensaje Informativo

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+59172345678",
    "message": "Su cita está programada para el 15/02/2026 a las 10:00 AM",
    "app": "SISTEMA_CITAS",
    "messageType": 2,
    "user": {
      "ci": "87654321",
      "nombreCompleto": "María López"
    }
  }'
```

### Ejemplo 3: Actualizar Estado

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message/status \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "67a42c2a88453f4c8d5b9d0e",
    "status": 1
  }'
```

### Ejemplo 4: Listar Mensajes con Filtros

```bash
# Todos los mensajes enviados exitosamente
curl "http://localhost:3515/api/v1/sms/messages?status=1&page=1&limit=20"

# Mensajes de tipo código pendientes
curl "http://localhost:3515/api/v1/sms/messages?messageType=1&status=0"

# Mensajes de una app específica
curl "http://localhost:3515/api/v1/sms/messages?app=UNIA"
```

### Ejemplo 5: Obtener Chat por chatId

```bash
curl "http://localhost:3515/api/v1/sms/messages/chat/a1b2c3d4e5f6g7h8?page=1&limit=50"
```

---

## 🔐 Variables de Entorno

Archivo `.env` requerido:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ms-sms-v2

# Servidor
PORT=3515
NODE_ENV=prod

# Otros
TZ=America/La_Paz
```

---

## 🚀 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Linter
npm run lint
```

---

## 📚 Recursos Adicionales

- **Documentación Swagger:** `http://localhost:3515/api/docs`
- **Ejemplos de cliente:** Ver carpeta `/ejemplos`
- **Changelog:** Ver archivo `CHANGELOG.md`

---

## 👥 Contacto

**Dirección Nacional de Tecnologías de la Información y Comunicación - Ministerio Público**

- 📧 Email: informatica@fiscalia.gob.bo
- 🌐 Web: Ministerio Público de Bolivia

---

**Última actualización:** 10 de febrero de 2026
