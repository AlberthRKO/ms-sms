# 🔧 Mejoras Implementadas - Microservicio SMS

## 🐛 Problema Detectado

Tu app Flutter estaba recibiendo DOS eventos cuando solo debería recibir UNO:

```
✅ send-message (correcto)
❌ send-message-status (incorrecto - no debería emitirse automáticamente)
```

## ✅ Soluciones Implementadas

### 1. **Corregido el Flujo de Eventos WebSocket**

**ANTES** (incorrecto):

- Al crear mensaje → emitía `send-message` ✅
- Al crear mensaje → emitía `send-message-status` ❌ (ERROR)

**AHORA** (correcto):

- Al crear mensaje → SOLO emite `send-message` ✅
- Al actualizar estado manualmente → SOLO entonces emite `send-message-status` ✅

### 2. **Agregado Sistema de ChatId para Agrupar Mensajes**

Se implementó un sistema inteligente de agrupación:

```typescript
// Genera un chatId único basado en teléfono + app
chatId = md5(telefono + app).substring(0, 16);

// Ejemplo:
// Teléfono: +59178945612
// App: "UNIA"
// chatId: "a1b2c3d4e5f6g7h8"
```

**Beneficios**:

- ✅ Todos los mensajes del mismo teléfono+app tienen el mismo chatId
- ✅ Puedes consultar el historial completo de una conversación
- ✅ Evita spam - los mensajes están organizados
- ✅ Fácil de rastrear y filtrar

### 3. **Nuevo Endpoint para Consultar Conversaciones**

```bash
GET /v1/sms/messages/chat/{chatId}
```

Obtiene todos los mensajes de una conversación específica.

**Ejemplo**:

```bash
curl http://localhost:3515/v1/sms/messages/chat/a1b2c3d4e5f6g7h8
```

## 📊 Estructura de Datos Actualizada

### Mensaje ahora incluye chatId:

```json
{
  "messageId": "698a1d2bb0513371576347f2",
  "chatId": "a1b2c3d4e5f6g7h8",  // ← NUEVO
  "phone": "+59178945612",
  "message": "Tu código es: 123456",
  "app": "UNIA",
  "messageType": 1,
  "status": 0,
  "user": { ... },
  "createdAt": "2026-02-09T17:45:15.458Z",
  "updatedAt": "2026-02-09T17:45:15.458Z"
}
```

## 🔄 Flujo Correcto Actualizado

### 1. **Crear Mensaje (desde tu sistema)**

```bash
POST /v1/sms/send-message
```

**Backend emite**: `send-message` (con chatId)
**Backend NO emite**: `send-message-status`

### 2. **Tu App Flutter Escucha**

```dart
socket.on('send-message', (data) {
  // Recibe el mensaje con chatId
  // Envía el SMS al proveedor
  // ...
});
```

### 3. **Tu App Actualiza Estado MANUALMENTE**

```bash
POST /v1/sms/send-message/status
{
  "messageId": "698a1d2bb0513371576347f2",
  "status": 1  // 1=enviado, 2=fallido
}
```

**Backend emite**: `send-message-status` (SOLO aquí)

### 4. **(Opcional) Escuchar Actualización de Estado**

```dart
socket.on('send-message-status', (data) {
  // Solo se emite cuando TÚ actualizas el estado
});
```

## 🎯 Casos de Uso del ChatId

### Ver todos los mensajes de un teléfono:

```bash
GET /v1/sms/messages/chat/a1b2c3d4e5f6g7h8
```

### Ver historial completo de una app:

```bash
GET /v1/sms/messages?app=UNIA
```

### Filtrar por chatId en tu app:

```dart
// El chatId viene en cada mensaje
final chatId = message['chatId'];

// Puedes agrupar mensajes localmente
Map<String, List> conversaciones = {};
conversaciones[chatId] = [message1, message2, ...];
```

## 📝 Endpoints Actualizados

| Método | Endpoint                        | Eventos Emitidos         |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/v1/sms/send-message`          | ✅ `send-message`        |
| POST   | `/v1/sms/send-message/status`   | ✅ `send-message-status` |
| GET    | `/v1/sms/messages`              | Ninguno                  |
| GET    | `/v1/sms/messages/chat/:chatId` | Ninguno                  |

## 🔍 Verificación

### En el backend (logs):

```
Mensaje creado - ChatID: a1b2c3d4e5f6g7h8, ID: 698a..., Tipo: CÓDIGO
Emitiendo evento 'send-message' - Tipo: 1, Tel: +59178945612
```

### En tu app Flutter:

```
📨 Nuevo mensaje: {
  chatId: "a1b2c3d4e5f6g7h8",
  messageId: "698a...",
  messageType: 1,
  status: 0,
  ...
}
```

**NO debería aparecer**:

```
❌ Estado actualizado: ... (a menos que llames manualmente al endpoint)
```

## 🎨 Mejoras Adicionales

1. **Logs Mejorados**: Incluyen chatId para mejor trazabilidad
2. **Índices MongoDB**: Agregado índice en chatId para búsquedas rápidas
3. **Hash Consistente**: Mismo teléfono+app siempre genera el mismo chatId
4. **Documentación**: Swagger actualizado con las descripciones correctas

## ⚠️ Importante

- El evento `send-message-status` SOLO se emite cuando llamas al endpoint de actualización
- Si tu app Flutter sigue recibiendo dos eventos, verifica que no estés llamando automáticamente al endpoint de actualización
- El chatId se genera automáticamente, no necesitas enviarlo

## 🚀 Próximos Pasos

1. Actualiza tu app Flutter para usar el chatId
2. Agrupa mensajes por chatId en tu interfaz
3. Implementa vista de conversaciones/historial
4. Usa el endpoint de chat para consultar historial

¡Todo funcionando correctamente! 🎉
