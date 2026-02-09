# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.1.0] - 2024-02-09

### 🎉 Features Agregados

#### Sistema de ChatId

- **Campo chatId agregado al schema** de mensajes
  - Generación automática mediante hash MD5 de teléfono + app
  - Índice en MongoDB para consultas rápidas
  - 16 caracteres hexadecimales únicos por conversación

- **Nuevo endpoint**: `GET /v1/sms/messages/chat/:chatId`
  - Obtiene todos los mensajes de una conversación específica
  - Ordenados por fecha de creación
  - Documentado en Swagger

- **Método generateChatId()** en SomeService
  - Normaliza teléfono eliminando espacios, guiones y +
  - Convierte a minúsculas para consistencia
  - Retorna hash MD5 truncado a 16 caracteres

### 🐛 Bug Fixes

#### Corrección de Eventos WebSocket Duplicados

- **ANTES**: Al crear un mensaje se emitían 2 eventos:
  - `send-message` ✅
  - `send-message-status` ❌ (incorrecto)
- **DESPUÉS**: Flujo correcto implementado:
  - `sendMessageByPhone()` → solo emite `send-message`
  - `updateMessageStatus()` → solo emite `send-message-status`

- **Impacto**: Reducción del 50% en eventos WebSocket innecesarios

### 📚 Documentación

#### Nuevos Documentos

- `MEJORAS_CHATID.md` - Explicación técnica detallada del sistema
- `RESUMEN_CHATID.md` - Resumen completo con tests y ejemplos
- `GUIA_FLUTTER_CHATID.md` - Guía de integración para Flutter
- `IMPLEMENTACION_FINAL.md` - Documento de cierre y estado del proyecto

#### Documentación Actualizada

- `README_SMS.md` - Agregado campo chatId en ejemplos
- `ejemplos/README.md` - Nuevo ejemplo de chatId documentado
- `ejemplos/test-api.http` - Test #15 agregado para endpoint de chatId

### 💡 Ejemplos

#### Nuevo Archivo

- `ejemplos/ejemplo-chatId.ts` - 4 ejemplos completos:
  1. Mensajes del mismo chat
  2. Mensajes de diferentes chats
  3. Mismo teléfono en diferentes apps
  4. Prevención de spam

#### Script NPM

- `npm run ejemplo:chatid` - Ejecuta ejemplos de chatId

### 🔧 Cambios Técnicos

#### Schema (some.schema.ts)

```typescript
@Prop({ type: String, required: true, index: -1 })
chatId: string;
```

#### Interface (some.interface.ts)

```typescript
export interface Messages extends Document {
  chatId: string; // NUEVO
  // ... otros campos
}
```

#### Service (some.service.ts)

```typescript
// NUEVO
private generateChatId(phone: string, app: string): string {
  const normalizedPhone = phone.replace(/[\s\-+]/g, '').trim();
  const dataToHash = `${normalizedPhone}${app}`.toLowerCase();
  return crypto.createHash('md5').update(dataToHash).digest('hex').substring(0, 16);
}

// NUEVO
async getMessagesByChatId(chatId: string): Promise<Messages[]> {
  return this.messagesModel.find({ chatId }).sort({ createdAt: -1 }).exec();
}

// MODIFICADO
async sendMessageByPhone(dto: SendMessageTextDTO): Promise<Messages> {
  const chatId = this.generateChatId(dto.phone, dto.app);
  const newMessage = await this.createMessage({ ...dto, chatId });
  this.gateway.emitSendMessage(newMessage); // Solo este evento
  return newMessage;
}
```

#### Controller (some.controller.ts)

```typescript
// NUEVO
@Get('messages/chat/:chatId')
@ApiOperation({ summary: 'Obtener mensajes de un chat específico' })
@ApiParam({ name: 'chatId', description: 'ID del chat' })
async getMessagesByChatId(@Param('chatId') chatId: string) {
  const data = await this.someService.getMessagesByChatId(chatId);
  return ResponseFormat.success(data, 'Mensajes del chat obtenidos exitosamente');
}
```

### 📊 Métricas de Rendimiento

- **Eventos WebSocket**: Reducción de 2 a 1 por mensaje creado (-50%)
- **Índices MongoDB**: 3 → 4 (+1 para chatId)
- **Endpoints API**: 3 → 4 (+1 para consulta por chatId)
- **Tiempo de consulta por chat**: O(n) → O(log n) con índice

### ✅ Tests

- ✅ Compilación TypeScript sin errores
- ✅ Verificación de eventos WebSocket corregidos
- ✅ Campo chatId presente en todos los mensajes nuevos
- ✅ Endpoint de chatId funcionando correctamente
- ✅ Ejemplos ejecutándose sin errores

---

## [1.0.0] - 2024-02-08

### 🎉 Release Inicial

#### Features

- **Microservicio SMS con NestJS**
  - Framework: NestJS 11.0.1
  - Adaptador: Fastify
  - Base de datos: MongoDB con Mongoose

- **Sistema de Tipos de Mensaje**
  - Tipo 1: SMS con código (requiere confirmación)
  - Tipo 2: Mensaje informativo (opcional confirmación)

- **Sistema de Estados**
  - 0: Pendiente
  - 1: Enviado
  - 2: Fallido

- **WebSocket con Socket.IO**
  - Evento `send-message`: Al crear mensaje
  - Evento `send-message-status`: Al actualizar estado
  - CORS habilitado para todos los orígenes

- **Endpoints REST**
  - `POST /v1/sms/send-message` - Crear y enviar mensaje
  - `POST /v1/sms/send-message/status` - Actualizar estado
  - `GET /v1/sms/messages` - Listar mensajes con filtros

- **Filtros Disponibles**
  - messageType (1 o 2)
  - status (0, 1, 2)
  - app (nombre de aplicación)
  - phone (número de teléfono)
  - Paginación (page, limit)

#### Documentación

- `README_SMS.md` - Documentación completa del microservicio
- `IMPLEMENTACION_COMPLETADA.md` - Guía de implementación
- Swagger UI disponible en `/api`

#### Ejemplos

- `ejemplos/cliente-websocket.ts` - Cliente Node.js WebSocket
- `ejemplos/monitor-websocket.html` - Monitor visual en navegador
- `ejemplos/test-api.http` - 14 tests HTTP con REST Client

#### Configuración

- Variables de entorno configurables (.env)
- Puerto por defecto: 3515
- MongoDB: localhost:27017
- CORS habilitado

---

## Formato del Changelog

Este changelog sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de Cambios

- `🎉 Features` - Nuevas características
- `🐛 Bug Fixes` - Corrección de bugs
- `📚 Documentación` - Cambios en documentación
- `🔧 Cambios Técnicos` - Refactoring o cambios internos
- `⚡ Performance` - Mejoras de rendimiento
- `🔒 Security` - Correcciones de seguridad
- `🗑️ Deprecated` - Funcionalidades obsoletas
- `❌ Removed` - Funcionalidades eliminadas

---

## Roadmap Futuro

### [1.2.0] - Planeado

- [ ] TTL automático para mensajes antiguos (30 días)
- [ ] Paginación en endpoint de chatId
- [ ] Endpoint de estadísticas por chat
- [ ] Rate limiting por chatId (5 mensajes/hora)
- [ ] Soft delete de mensajes

### [1.3.0] - Planeado

- [ ] Autenticación JWT
- [ ] Roles y permisos
- [ ] Logs estructurados (Winston)
- [ ] Métricas con Prometheus
- [ ] Health checks

### [2.0.0] - Futuro

- [ ] Soporte multi-tenant
- [ ] Templates de mensajes
- [ ] Programación de mensajes
- [ ] Webhooks para eventos
- [ ] Dashboard de administración

---

**Última actualización**: 2024-02-09
