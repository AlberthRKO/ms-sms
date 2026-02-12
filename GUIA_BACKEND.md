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
- ✅ Gestión de estados de mensajes (Pendiente, Enviado, Fallido)
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

- Crea un mensaje en la base de datos con estado `Pendiente`
- Emite el evento `send-message` para que apps externas lo procesen
- NO emite automáticamente el evento de estado

**Request Body:**

```json
{
  "origen": {
    "aplicacion": "JL-Penal",
    "modulo": "Login",
    "numero": "+59163354864",
    "usuario": {
      "ci": "14258827",
      "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
    }
  },
  "destino": {
    "numero": "+59163354864",
    "mensaje": "Codigo ROMA: 693484",
    "fichero": false,
    "tipo": "Codigo"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Mensaje creado exitosamente",
  "data": {
    "_id": "698c7c7c3f52a806f3dea18d",
    "origen": {
      "aplicacion": "JL-Penal",
      "modulo": "Login",
      "numero": "+59163354864",
      "usuario": {
        "ci": "14258827",
        "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
      }
    },
    "destino": {
      "numero": "+59163354864",
      "mensaje": "Codigo ROMA: 693484",
      "fichero": false,
      "tipo": "Codigo"
    },
    "estado": "Pendiente",
    "createdAt": "2026-02-11T12:56:28.443Z",
    "updatedAt": "2026-02-11T12:56:28.443Z"
  }
}
```

---

### 2. **POST** `/sms/send-message/status`

Actualiza el estado de un mensaje existente y emite evento `send-message-status`.

**Descripción:**

- La app externa llama este endpoint después de enviar el SMS
- Actualiza el estado del mensaje (Pendiente → Enviado o Fallido)
- Emite el evento `send-message-status` para notificar el cambio

**Request Body:**

```json
{
  "messageId": "698c7c7c3f52a806f3dea18d",
  "estado": "Enviado"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Estado actualizado exitosamente",
  "data": {
    "_id": "698c7c7c3f52a806f3dea18d",
    "origen": {
      "aplicacion": "JL-Penal",
      "modulo": "Login",
      "numero": "+59163354864",
      "usuario": {
        "ci": "14258827",
        "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
      }
    },
    "destino": {
      "numero": "+59163354864",
      "mensaje": "Codigo ROMA: 693484",
      "fichero": false,
      "tipo": "Codigo"
    },
    "estado": "Enviado",
    "createdAt": "2026-02-11T12:56:28.443Z",
    "updatedAt": "2026-02-11T12:56:28.699Z"
  }
}
```

---

### 3. **GET** `/sms/messages`

Lista todos los mensajes con filtros opcionales y paginación.

**Query Parameters:**

- `tipo` (opcional): Filtrar por tipo ("Codigo" o "Informativo")
- `estado` (opcional): Filtrar por estado ("Pendiente", "Enviado", "Fallido")
- `numero` (opcional): Filtrar por número de destino
- `aplicacion` (opcional): Filtrar por aplicación de origen
- `page` (opcional, default=1): Número de página
- `limit` (opcional, default=10): Registros por página

**Ejemplo:**

```
GET /sms/messages?tipo=Codigo&estado=Enviado&page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "message": "Mensajes obtenidos exitosamente",
  "data": [
    {
      "_id": "698c7c7c3f52a806f3dea18d",
      "origen": {
        "aplicacion": "JL-Penal",
        "modulo": "Login",
        "numero": "+59163354864",
        "usuario": {
          "ci": "14258827",
          "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
        }
      },
      "destino": {
        "numero": "+59163354864",
        "mensaje": "Codigo ROMA: 693484",
        "fichero": false,
        "tipo": "Codigo"
      },
      "estado": "Enviado",
      "createdAt": "2026-02-11T12:56:28.443Z",
      "updatedAt": "2026-02-11T12:56:28.699Z"
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

## 📦 DTOs y su Significado

### 1. **SendMessageTextDTO**

DTO para crear un nuevo mensaje SMS.

```typescript
{
  origen: {
    aplicacion: string;      // Aplicación de origen (ej: "JL-Penal", "ms-auth")
    modulo: string;          // Módulo de origen (ej: "Login", "Registro")
    numero: string;          // Número desde donde se envía (+59163354864)
    usuario: {
      ci: string;            // CI del usuario
      nombreCompleto: string; // Nombre completo del usuario
    }
  },
  destino: {
    numero: string;          // Número destino que recibirá el SMS (+59163354864)
    mensaje: string;         // Contenido del mensaje (máx. 4096 caracteres)
    fichero: boolean;        // Indica si incluye fichero adjunto (default: false)
    tipo: string;            // "Codigo" o "Informativo"
  }
}
```

**Validaciones:**

- `origen.aplicacion`: Obligatorio, cadena de texto
- `origen.modulo`: Obligatorio, cadena de texto
- `origen.numero`: 8-15 dígitos, debe coincidir con formato de teléfono internacional
- `origen.usuario.ci`: Obligatorio
- `origen.usuario.nombreCompleto`: Obligatorio
- `destino.numero`: 8-15 dígitos, debe coincidir con formato de teléfono internacional
- `destino.mensaje`: Obligatorio, máximo 4096 caracteres
- `destino.fichero`: Booleano, opcional (default: false)
- `destino.tipo`: Debe ser "Codigo" o "Informativo"

---

### 2. **UpdateMessageStatusDTO**

DTO para actualizar el estado de un mensaje.

```typescript
{
  messageId: string; // ObjectId de MongoDB
  estado: string; // "Pendiente", "Enviado" o "Fallido"
}
```

**Validaciones:**

- `messageId`: Debe ser un ObjectId válido de MongoDB
- `estado`: Debe ser "Pendiente", "Enviado" o "Fallido"

---

### 3. **ListMessagesQueryDTO**

DTO para buscar y filtrar mensajes.

```typescript
{
  tipo?: string;        // Filtro por tipo ("Codigo" o "Informativo")
  estado?: string;      // Filtro por estado ("Pendiente", "Enviado", "Fallido")
  numero?: string;      // Filtro por número de destino (búsqueda parcial)
  aplicacion?: string;  // Filtro por aplicación (búsqueda parcial)
  page?: number;        // Número de página (default: 1)
  limit?: number;       // Registros por página (default: 10)
}
```

---

### 4. **Enumeraciones**

#### MessageType

```typescript
enum MessageType {
  CODE = 'Codigo', // SMS con código de verificación
  INFO = 'Informativo', // Mensaje informativo general
}
```

#### MessageStatus

```typescript
enum MessageStatus {
  PENDING = 'Pendiente', // Pendiente de envío
  SENT = 'Enviado', // Enviado correctamente
  FAILED = 'Fallido', // Falló el envío
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
  _id: string;
  origen: {
    aplicacion: string;
    modulo: string;
    numero: string;
    usuario: {
      ci: string;
      nombreCompleto: string;
    }
  }
  destino: {
    numero: string;
    mensaje: string;
    fichero: boolean;
    tipo: string;
  }
  estado: string;
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
  enviarSMS(payload.destino.numero, payload.destino.mensaje);
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
  _id: string;
  origen: {
    aplicacion: string;
    modulo: string;
    numero: string;
    usuario: {
      ci: string;
      nombreCompleto: string;
    }
  }
  destino: {
    numero: string;
    mensaje: string;
    fichero: boolean;
    tipo: string;
  }
  estado: string; // "Pendiente", "Enviado" o "Fallido"
  createdAt: Date;
  updatedAt: Date;
}
```

**Propósito:**
Notifica a los clientes conectados sobre cambios en el estado de un mensaje.

**Ejemplo de escucha (Cliente):**

```javascript
socket.on('send-message-status', (payload) => {
  console.log(`Mensaje ${payload._id} cambió a estado: ${payload.estado}`);
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
  origen: {                   // Información de origen
    aplicacion: string,       // Aplicación de origen (ej: "JL-Penal")
    modulo: string,           // Módulo de origen (ej: "Login")
    numero: string,           // Número desde donde se envía
    usuario: {
      ci: string,             // CI del usuario
      nombreCompleto: string  // Nombre completo del usuario
    }
  },
  destino: {                  // Información de destino
    numero: string,           // Número que recibirá el SMS
    mensaje: string,          // Contenido del mensaje
    fichero: boolean,         // Indica si incluye fichero (default: false)
    tipo: string              // "Codigo" o "Informativo"
  },
  estado: string,             // "Pendiente", "Enviado" o "Fallido"
  createdAt: Date,            // Timestamp de creación
  updatedAt: Date             // Timestamp de última actualización
}
```

#### Índices

```javascript
{
  'destino.numero': -1,       // Índice para búsquedas por número destino
  'destino.tipo': -1,         // Índice para filtrado por tipo
  'origen.aplicacion': -1,    // Índice para búsquedas por aplicación
  estado: -1                  // Índice para filtrado por estado
}
```

#### Ejemplo de Documento

```json
{
  "_id": "698c7c7c3f52a806f3dea18d",
  "origen": {
    "aplicacion": "JL-Penal",
    "modulo": "Login",
    "numero": "+59163354864",
    "usuario": {
      "ci": "14258827",
      "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
    }
  },
  "destino": {
    "numero": "+59163354864",
    "mensaje": "Codigo ROMA: 693484",
    "fichero": false,
    "tipo": "Codigo"
  },
  "estado": "Enviado",
  "createdAt": "2026-02-11T12:56:28.443Z",
  "updatedAt": "2026-02-11T12:56:28.699Z"
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
   - Backend valida el DTO y crea el mensaje con estado `Pendiente`
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
    "origen": {
      "aplicacion": "JL-Penal",
      "modulo": "Login",
      "numero": "+59163354864",
      "usuario": {
        "ci": "14258827",
        "nombreCompleto": "ALBERTO ORLANDO PAREDES MAMANI"
      }
    },
    "destino": {
      "numero": "+59163354864",
      "mensaje": "Codigo ROMA: 693484",
      "fichero": false,
      "tipo": "Codigo"
    }
  }'
```

### Ejemplo 2: Enviar Mensaje Informativo

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "origen": {
      "aplicacion": "SISTEMA_CITAS",
      "modulo": "Notificaciones",
      "numero": "+59172345678",
      "usuario": {
        "ci": "87654321",
        "nombreCompleto": "María López"
      }
    },
    "destino": {
      "numero": "+59172345678",
      "mensaje": "Su cita está programada para el 15/02/2026 a las 10:00 AM",
      "fichero": false,
      "tipo": "Informativo"
    }
  }'
```

### Ejemplo 3: Actualizar Estado a Enviado

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message/status \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "698c7c7c3f52a806f3dea18d",
    "estado": "Enviado"
  }'
```

### Ejemplo 4: Actualizar Estado a Fallido

```bash
curl -X POST http://localhost:3515/api/v1/sms/send-message/status \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "698c7c7c3f52a806f3dea18d",
    "estado": "Fallido"
  }'
```

### Ejemplo 5: Listar Mensajes con Filtros

```bash
# Todos los mensajes enviados exitosamente
curl "http://localhost:3515/api/v1/sms/messages?estado=Enviado&page=1&limit=20"

# Mensajes de tipo código pendientes
curl "http://localhost:3515/api/v1/sms/messages?tipo=Codigo&estado=Pendiente"

# Mensajes de una app específica
curl "http://localhost:3515/api/v1/sms/messages?aplicacion=JL-Penal"

# Mensajes a un número específico
curl "http://localhost:3515/api/v1/sms/messages?numero=59163354864"
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
