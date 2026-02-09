/**
 * Ejemplo de Cliente WebSocket para Escuchar Mensajes SMS
 *
 * Esta app externa escucha los eventos del microservicio y envía los SMS
 *
 * INSTALACIÓN:
 * cd ejemplos
 * npm install (o yarn install)
 *
 * EJECUTAR:
 * npm run client:dev
 *
 * O directamente con tsx:
 * npx tsx cliente-websocket.ts
 */

import { io } from 'socket.io-client';
import axios from 'axios';

// Configuración
const SOCKET_URL = 'http://localhost:3515';
const API_BASE_URL = 'http://localhost:3515/v1/sms';

// Tu proveedor de SMS (ejemplo)
const SMS_PROVIDER_API = 'https://api.proveedorsms.com/send';
const SMS_API_KEY = 'tu-api-key';

// Conectar al WebSocket
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor WebSocket');
  console.log('Socket ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado del servidor WebSocket');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});

/**
 * Escuchar evento de nuevo mensaje
 */
socket.on('send-message', async (data) => {
  console.log('📨 Nuevo mensaje recibido:', {
    messageId: data.messageId,
    phone: data.phone,
    messageType: data.messageType === 1 ? 'CÓDIGO' : 'INFORMATIVO',
    app: data.app,
  });

  const { messageId, phone, message, messageType } = data;

  try {
    // Enviar SMS al proveedor
    console.log(`📤 Enviando SMS a ${phone}...`);
    const smsResult = await enviarSMSAlProveedor(phone, message);

    if (smsResult.success) {
      console.log('✅ SMS enviado exitosamente');

      // Si es tipo 1 (código), OBLIGATORIO actualizar estado
      if (messageType === 1) {
        await actualizarEstadoMensaje(messageId, 1); // 1 = ENVIADO
        console.log('✅ Estado actualizado a ENVIADO (tipo código)');
      }
      // Si es tipo 2 (informativo), opcional actualizar
      else if (messageType === 2) {
        await actualizarEstadoMensaje(messageId, 1);
        console.log('✅ Estado actualizado a ENVIADO (tipo informativo)');
      }
    } else {
      throw new Error('Respuesta no exitosa del proveedor');
    }
  } catch (error) {
    console.error('❌ Error al enviar SMS:', error.message);

    // Actualizar estado a FALLIDO
    await actualizarEstadoMensaje(messageId, 2); // 2 = FALLIDO
    console.log('⚠️ Estado actualizado a FALLIDO');
  }
});

/**
 * Escuchar actualizaciones de estado (opcional, para monitoreo)
 */
socket.on('send-message-status', (data) => {
  console.log('📊 Estado actualizado:', {
    messageId: data.messageId,
    status: data.status === 0 ? 'PENDIENTE' : data.status === 1 ? 'ENVIADO' : 'FALLIDO',
  });
});

/**
 * Función para enviar SMS al proveedor
 */
async function enviarSMSAlProveedor(phone: string, message: string) {
  try {
    // Ejemplo usando Twilio, Vonage, o cualquier proveedor
    const response = await axios.post(
      SMS_PROVIDER_API,
      {
        to: phone,
        message: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SMS_API_KEY}`,
        },
      },
    );

    return {
      success: response.status === 200,
      data: response.data,
    };
  } catch (error) {
    console.error('Error del proveedor:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Función para actualizar el estado del mensaje
 */
async function actualizarEstadoMensaje(messageId: string, status: number) {
  try {
    const response = await axios.post(`${API_BASE_URL}/send-message/status`, {
      messageId,
      status,
    });

    return response.data;
  } catch (error) {
    console.error('Error al actualizar estado:', error.response?.data || error.message);
    throw error;
  }
}

// Mantener la app corriendo
console.log('🚀 App externa iniciada y escuchando mensajes SMS...');
console.log(`📡 Conectando a: ${SOCKET_URL}`);
console.log('');
console.log('Tipos de mensaje:');
console.log('  1 = SMS con código (requiere confirmación de envío)');
console.log('  2 = Mensaje informativo (confirmación opcional)');
console.log('');
console.log('Estados:');
console.log('  0 = Pendiente');
console.log('  1 = Enviado');
console.log('  2 = Fallido');
console.log('');

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando conexión WebSocket...');
  socket.disconnect();
  process.exit(0);
});
