# CAMBIOS Y ACTUALIZACIONES

## [0.1.1](https://git.mp.gob.bo/microservices/ms-sms-v2/compare/v0.1.0...v0.1.1) (2026-03-03)

### 🚀 Features

* agrega soporte para el campo 'entorno' en el envío y listado de mensajes, mejorando la flexibilidad del servicio SMS  jira/MS-19 ([4403882](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/44038821c3388d3d5d5e5c2a403d6c8637b16cac))

### 🐞 Bug Fixes

* corrige formato de mensaje de texto en función de entorno en el servicio SMS  jira/MS-19 ([f2df851](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/f2df851887cac9cb93a8920a81eda9ea4a9a10e1))

## 0.1.0 (2026-03-03)

### 🚀 Features

* despliegue en dev ([a1faf94](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/a1faf9465606354b03d736112e105cc2ae1d3a63))
* implementa cuota mensual de sms controlados por variable de entorno  jira/MS-18 ([6da51aa](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/6da51aaa7315c53a84d03b0a714f522599b28d27))
* mejora cuota de validacion de SMS para retornar informacion en logs  jira/MS-18 ([b12a7c9](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/b12a7c9ecd01ac9f0c2ba3aa4a3f58022644e4fd))

### 🐞 Bug Fixes

* aumento de corepack ([c6f4273](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/c6f42732891d7ec9c206dc8a5dd2b9115810e70e))
* bajando node a 22.12 ([98f0d6d](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/98f0d6d2a42444e2c8b0402803491b4c9b902b3d))
* cambio de docker sin vulnerabilidad ([d745b57](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/d745b57e3a0b3cb45ba41929b7d0dad216b0b0f5))
* cambio de node a 25.6.0 ([47f5255](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/47f5255ee86d1bb2e1f7fc44ee31e9b2d38032b9))
* cambio de node en upload ([a46596d](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/a46596d48dbac8c4a9f01305bc489ec997a9045f))
* correcion de ramas en CICD ([7eb25dd](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/7eb25dda5ddeb93944452d1dafeb0edd404b5670))
* disminuyendo node a 24.12.0 ([826365a](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/826365ab81fbdec19283001f911acb7e9b754b25))
* eliminando package manager ([17d1224](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/17d1224c57232b81dd9302a0856b62cf090ae91d))
* error en ruta main ([aacd2de](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/aacd2debf0bed46f9df16e40b727cfe0ea3edb2d))
* error en ruta main ([6eb1174](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/6eb11749357ced1afd112ea81bb055e7a6edbbe0))
* usando yarn en vez de npm ([e1fad99](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/e1fad99b87232ddac3c3ab615f641b6baf227289))

### ♻️ Code Refactoring

* cambia nombres de clases y archivos mejorando legibilidad  jira/MS-17 ([6878742](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/687874263093fe4b65fa233633ab44901d1aec8d))
* simplifica la creacion de sms y actualiza como opcional la propiedad usuario de origen  jira/MS-18 ([375e909](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/375e9096680500da6e0a52b5314a369f1c4cea12))

### 📦 Maintenance

* proyecto base con fastify ([5f2f457](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/5f2f45718c9d1ea3553ac0d39bd2895f45defc81))
* suprime logs de gateway ([9c10d0f](https://git.mp.gob.bo/microservices/ms-sms-v2/commit/9c10d0fb557a2779ba725af836af23ff2e5e27b2))

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
