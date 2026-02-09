# Microservicio SMS - Documentación

## 📋 Descripción General

Microservicio para gestión de mensajes SMS con dos tipos:

- **Tipo 1**: SMS con código (requiere confirmación de envío)
- **Tipo 2**: Mensaje informativo (sin confirmación requerida)

## 🔄 Flujo de Trabajo

### 1. Crear y Enviar Mensaje

```
Sistema Cliente → POST /v1/sms/send-message → Backend → MongoDB
                                                    ↓
                                            WebSocket Event
                                                    ↓
                                            App Externa (escucha)
```

**Endpoint**: `POST /v1/sms/send-message`

**Body**:

```json
{
  "mode": "prod",
  "phone": "+59178945612",
  "message": "Tu código de verificación es: 123456",
  "app": "UNIA",
  "messageType": 1,
  "user": {
    "ci": "12345678",
    "nombreCompleto": "Juan Perez",
    "msPersonaId": 123,
    "funcionarioId": 456,
    "institucionId": 789,
    "oficinaId": 101
  }
}
```

**Respuesta**:

```json
{
  "error": false,
  "message": "Mensaje creado exitosamente",
  "status": 200,
  "response": {
    "data": {
      "messageId": "67a42c2a88453f4c8d5b9d0e",
      "chatId": "a1b2c3d4e5f6g7h8",
      "phone": "+59178945612",
      "message": "Tu código de verificación es: 123456",
      "app": "UNIA",
      "messageType": 1,
      "status": 0,
      "user": { ... },
      "createdAt": "2026-02-09T20:00:00.000Z",
      "updatedAt": "2026-02-09T20:00:00.000Z"
    }
  }
}
```

### 2. App Externa Escucha Evento WebSocket

La app externa se conecta al WebSocket y escucha el evento `send-message`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3515');

socket.on('send-message', async (data) => {
  console.log('Nuevo mensaje recibido:', data);

  const { messageId, phone, message, messageType } = data;

  // Enviar el SMS a través del proveedor
  try {
    await enviarSMSAlProveedor(phone, message);

    // Si es tipo 1 (código), actualizar estado a ENVIADO
    if (messageType === 1) {
      await actualizarEstado(messageId, 1); // 1 = ENVIADO
    }

    // Si es tipo 2 (informativo), opcionalmente actualizar
    if (messageType === 2) {
      await actualizarEstado(messageId, 1);
    }
  } catch (error) {
    // Si falla, actualizar estado a FALLIDO
    await actualizarEstado(messageId, 2); // 2 = FALLIDO
  }
});
```

### 3. Actualizar Estado del Mensaje

**Endpoint**: `POST /v1/sms/send-message/status`

**Body**:

```json
{
  "messageId": "67a42c2a88453f4c8d5b9d0e",
  "status": 1
}
```

**Respuesta**:

```json
{
  "error": false,
  "message": "Estado actualizado exitosamente",
  "status": 200,
  "response": {
    "data": {
      "messageId": "67a42c2a88453f4c8d5b9d0e",
      "status": 1,
      ...
    }
  }
}
```

### 4. Listar Mensajes

**Endpoint**: `GET /v1/sms/messages`

**Query Params**:

- `messageType`: 1 (código) o 2 (informativo)
- `status`: 0 (pendiente), 1 (enviado), 2 (fallido)
- `phone`: filtrar por teléfono
- `app`: filtrar por aplicación
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)

**Ejemplo**:

```
GET /v1/sms/messages?messageType=1&status=1&page=1&limit=10
```

**Respuesta**:

```json
{
  "error": false,
  "message": "Mensajes obtenidos exitosamente",
  "status": 200,
  "response": {
    "data": [
      {
        "messageId": "67a42c2a88453f4c8d5b9d0e",
        "phone": "+59178945612",
        "message": "Tu código es: 123456",
        "app": "UNIA",
        "messageType": 1,
        "status": 1,
        "createdAt": "2026-02-09T20:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

## 📊 Tipos y Estados

### Tipos de Mensaje (messageType)

- `1`: SMS con código (requiere actualización de estado)
- `2`: Mensaje informativo (opcional actualizar estado)

### Estados (status)

- `0`: Pendiente (mensaje creado, esperando envío)
- `1`: Enviado (SMS enviado correctamente)
- `2`: Fallido (error al enviar)

## 🔌 Eventos WebSocket

### Evento: `send-message`

Se emite cuando se crea un nuevo mensaje.

**Payload**:

```json
{
  "messageId": "67a42c2a88453f4c8d5b9d0e",
  "chatId": "a1b2c3d4e5f6g7h8",
  "phone": "+59178945612",
  "message": "Tu código es: 123456",
  "app": "UNIA",
  "messageType": 1,
  "status": 0,
  "user": { ... },
  "createdAt": "2026-02-09T20:00:00.000Z"
}
```

### Evento: `send-message-status`

Se emite cuando se actualiza el estado de un mensaje.

**Payload**:

```json
{
  "messageId": "67a42c2a88453f4c8d5b9d0e",
  "status": 1,
  ...
}
```

## 🚀 Endpoints Disponibles

| Método | Endpoint                      | Descripción                       |
| ------ | ----------------------------- | --------------------------------- |
| POST   | `/v1/sms/send-message`        | Crear y enviar mensaje SMS        |
| POST   | `/v1/sms/send-message/status` | Actualizar estado del mensaje     |
| GET    | `/v1/sms/messages`            | Listar mensajes con filtros       |
| GET    | `/v1/sms/messages/chat/:id`   | Obtener mensajes de un chat/grupo |

## 📝 Notas Importantes

1. **Tipo 1 (Código)**: La app externa DEBE actualizar el estado después de enviar
2. **Tipo 2 (Informativo)**: La app externa puede actualizar el estado opcionalmente
3. Todos los mensajes inician con `status: 0` (pendiente)
4. El backend NO envía los SMS, solo gestiona el registro y eventos
5. La app externa es responsable de enviar los SMS al proveedor
6. **chatId**: Se genera automáticamente como hash MD5 de `teléfono+app` para agrupar mensajes de la misma conversación

## 🔗 WebSocket Connection

```javascript
// Cliente Node.js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3515');

// Cliente Browser
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3515');
  socket.on('send-message', (data) => {
    console.log('Mensaje recibido:', data);
  });
</script>
```

## 📦 Colección de MongoDB

**Colección**: `messages`

**Índices**:

- `chatId` (descendente) - Agrupación de mensajes por conversación
- `phone` (descendente)
- `messageType` (descendente)
- `status` (descendente)
