# 📱 Microservicio SMS - Resumen de Implementación

## ✅ Implementación Completada

El microservicio SMS ha sido completamente implementado y está funcional con las siguientes características:

### 🎯 Características Principales

1. **Dos Tipos de Mensajes**:
   - **Tipo 1 (messageType=1)**: SMS con código - Requiere confirmación de envío
   - **Tipo 2 (messageType=2)**: Mensaje informativo - Confirmación opcional

2. **Estados de Mensajes**:
   - **0 (PENDING)**: Mensaje creado, esperando envío
   - **1 (SENT)**: Mensaje enviado correctamente
   - **2 (FAILED)**: Falló el envío

3. **WebSocket en Tiempo Real**:
   - Evento `send-message`: Se emite cuando se crea un mensaje
   - Evento `send-message-status`: Se emite cuando se actualiza el estado

### 📋 Endpoints Disponibles

| Método | Endpoint                      | Descripción                 |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/v1/sms/send-message`        | Crear mensaje SMS           |
| POST   | `/v1/sms/send-message/status` | Actualizar estado           |
| GET    | `/v1/sms/messages`            | Listar mensajes con filtros |

### 🔄 Flujo de Trabajo

```
1. Sistema Cliente
   ↓ POST /v1/sms/send-message
   ↓ { phone, message, messageType: 1 o 2 }
   ↓
2. Backend Microservicio
   ↓ Guarda en MongoDB (status: 0 - PENDING)
   ↓ Emite WebSocket evento 'send-message'
   ↓
3. App Externa (Tu aplicación que envía SMS)
   ↓ Escucha WebSocket
   ↓ Recibe datos del mensaje
   ↓ Envía SMS al proveedor (Twilio, etc)
   ↓
   ↓ Si messageType === 1 (código):
   ↓   → OBLIGATORIO actualizar estado
   ↓   → POST /v1/sms/send-message/status
   ↓   → { messageId, status: 1 o 2 }
   ↓
   ↓ Si messageType === 2 (informativo):
   ↓   → OPCIONAL actualizar estado
```

### 📁 Archivos Modificados/Creados

#### Módulo SMS (src/modules/some-module/)

- ✅ `dto/message-status.enum.ts` - Enums de tipos y estados
- ✅ `dto/some.input.dto.ts` - DTOs de entrada (SendMessage, UpdateStatus, ListMessages)
- ✅ `dto/some.schema.ts` - Schema de MongoDB
- ✅ `dto/some.interface.ts` - Interfaces TypeScript
- ✅ `some.gateway.ts` - WebSocket Gateway
- ✅ `some.service.ts` - Lógica de negocio
- ✅ `some.controller.ts` - Endpoints REST
- ✅ `some.module.ts` - Módulo NestJS

#### Documentación y Ejemplos

- ✅ `README_SMS.md` - Documentación completa
- ✅ `ejemplos/cliente-websocket.ts` - Cliente Node.js para escuchar eventos
- ✅ `ejemplos/test-api.http` - Ejemplos de requests HTTP
- ✅ `ejemplos/monitor-websocket.html` - Monitor visual en tiempo real

### 🚀 Cómo Usar

#### 1. El backend ya está corriendo en:

```
http://localhost:3515/api
```

#### 2. Swagger disponible en:

```
http://localhost:3515/api
```

#### 3. Para conectarse al WebSocket:

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3515');

socket.on('send-message', (data) => {
  console.log('Nuevo mensaje:', data);
  // Aquí envías el SMS al proveedor
});
```

#### 4. Abrir el monitor visual:

Abre en tu navegador: `ejemplos/monitor-websocket.html`

### 📝 Ejemplo Completo de Uso

#### Paso 1: Enviar mensaje con código

```bash
curl -X POST http://localhost:3515/v1/sms/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+59178945612",
    "message": "Tu código es: 123456",
    "app": "UNIA",
    "messageType": 1,
    "user": {
      "ci": "12345678",
      "nombreCompleto": "Juan Perez"
    }
  }'
```

#### Paso 2: Tu app externa recibe el evento WebSocket

```javascript
// El evento incluye:
{
  messageId: "67a42c2a88453f4c8d5b9d0e",
  phone: "+59178945612",
  message: "Tu código es: 123456",
  messageType: 1,
  status: 0,
  ...
}
```

#### Paso 3: Tu app envía el SMS y actualiza el estado

```bash
curl -X POST http://localhost:3515/v1/sms/send-message/status \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "67a42c2a88453f4c8d5b9d0e",
    "status": 1
  }'
```

#### Paso 4: Listar mensajes

```bash
# Todos los mensajes
curl http://localhost:3515/v1/sms/messages

# Solo códigos enviados
curl http://localhost:3515/v1/sms/messages?messageType=1&status=1

# Por aplicación
curl http://localhost:3515/v1/sms/messages?app=UNIA&page=1&limit=10
```

### 🔍 Filtros Disponibles en GET /messages

- `messageType`: 1 (código) o 2 (informativo)
- `status`: 0 (pendiente), 1 (enviado), 2 (fallido)
- `phone`: búsqueda parcial por teléfono
- `app`: búsqueda parcial por aplicación
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)

### ⚙️ Base de Datos

**Colección MongoDB**: `messages`

**Campos**:

```javascript
{
  _id: ObjectId,
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

**Índices**:

- `phone` (descendente)
- `messageType` (descendente)
- `status` (descendente)

### 🎨 Monitor Visual

Abre `ejemplos/monitor-websocket.html` en tu navegador para ver:

- Conexión WebSocket en tiempo real
- Estadísticas (total, códigos, informativos)
- Últimos 50 mensajes recibidos
- Actualizaciones de estado

### 📱 Para Tu App Externa

1. Ve a la carpeta de ejemplos:

```bash
cd ejemplos
```

2. Instala dependencias (solo la primera vez):

```bash
npm install
```

3. Ejecuta el cliente WebSocket:

```bash
# Opción 1: Con script npm
npm run client:dev

# Opción 2: Con script bash
./iniciar-cliente.sh

# Opción 3: Directamente con tsx
npx tsx cliente-websocket.ts
```

4. Configura tu proveedor de SMS en `cliente-websocket.ts`

5. ¡Listo! El cliente escuchará eventos y enviará SMS automáticamente

### 🔐 Importante

- **messageType = 1**: OBLIGATORIO actualizar estado después de enviar
- **messageType = 2**: OPCIONAL actualizar estado
- Todos los mensajes inician con `status: 0` (pendiente)
- El backend NO envía SMS, solo gestiona registro y eventos
- Tu app externa es responsable del envío real

### 📞 URLs Importantes

- **API Base**: http://localhost:3515/v1/sms
- **Swagger**: http://localhost:3515/api
- **WebSocket**: ws://localhost:3515

### ✨ Todo Listo!

El microservicio está completamente funcional y listo para usar. Revisa los archivos en la carpeta `ejemplos/` para ver implementaciones completas.
