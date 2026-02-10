# Ejemplos del Microservicio SMS

Este directorio contiene ejemplos funcionales para usar el microservicio SMS.

## 📦 Instalación

```bash
cd ejemplos
npm install
# o
yarn install
```

## 🚀 Ejecutar Cliente WebSocket

Este cliente escucha los eventos del microservicio y simula el envío de SMS.

```bash
# Opción 1: Con script npm
npm run client:dev

# Opción 2: Con tsx directamente
npx tsx cliente-websocket.ts

# Opción 3: Con ts-node
npx ts-node cliente-websocket.ts
```

## 📝 Archivos

- **cliente-websocket.ts** - Cliente Node.js que escucha eventos WebSocket
- **monitor-websocket.html** - Monitor visual en navegador (abrir directamente)
- **test-api.http** - Tests HTTP para VSCode REST Client
- **ejemplo-chatId.ts** - Ejemplos de uso del sistema de chatId para agrupación de mensajes

## 🔧 Configuración

Edita las variables en `cliente-websocket.ts`:

```typescript
const SOCKET_URL = 'http://localhost:3515';
const API_BASE_URL = 'http://localhost:3515/v1/sms';
const SMS_PROVIDER_API = 'https://api.proveedorsms.com/send';
const SMS_API_KEY = 'tu-api-key';
```

## 💡 Uso

### Cliente WebSocket

1. Asegúrate que el microservicio esté corriendo en `http://localhost:3515`
2. Ejecuta el cliente: `npm run client:dev`
3. El cliente escuchará eventos y mostrará en consola
4. Cuando reciba un mensaje, simulará el envío y actualizará el estado

### Ejemplos de ChatId

Ejecuta los ejemplos de agrupación de mensajes:

```bash
npx tsx ejemplo-chatId.ts
```

Este script demuestra:

- Cómo se agrupan mensajes del mismo teléfono/app
- Diferencia entre chats por app o teléfono
- Prevención de spam usando chatId
- Consulta de historial por chat

## 🌐 Monitor Visual

Abre `monitor-websocket.html` directamente en tu navegador para ver una interfaz visual de los mensajes en tiempo real.
