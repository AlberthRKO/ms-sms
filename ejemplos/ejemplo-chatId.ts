/**
 * EJEMPLO DE USO: ChatId
 * 
 * Este archivo demuestra cómo usar el sistema de chatId
 * para agrupar mensajes de una misma conversación.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3515/v1/sms';

/**
 * Función auxiliar para crear mensajes de prueba
 */
async function enviarMensaje(
  phone: string,
  app: string,
  message: string,
  messageType: 1 | 2
) {
  try {
    const response = await axios.post(`${BASE_URL}/send-message`, {
      mode: 'prod',
      phone,
      message,
      app,
      messageType,
      user: {
        ci: '12345678',
        nombreCompleto: 'Usuario de Prueba',
      },
    });

    console.log('✅ Mensaje enviado:', {
      messageId: response.data.response.data.messageId,
      chatId: response.data.response.data.chatId,
      phone: response.data.response.data.phone,
      app: response.data.response.data.app,
    });

    return response.data.response.data;
  } catch (error: any) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Obtener todos los mensajes de un chatId
 */
async function obtenerMensajesPorChat(chatId: string) {
  try {
    const response = await axios.get(`${BASE_URL}/messages/chat/${chatId}`);

    console.log(`\n📬 Mensajes del chat ${chatId}:`);
    console.log(`Total: ${response.data.response.data.length} mensajes\n`);

    response.data.response.data.forEach((msg: any, index: number) => {
      console.log(`${index + 1}. ${msg.message}`);
      console.log(`   Estado: ${msg.status} | Tipo: ${msg.messageType}`);
      console.log(`   Fecha: ${new Date(msg.createdAt).toLocaleString()}\n`);
    });

    return response.data.response.data;
  } catch (error: any) {
    console.error('❌ Error al obtener mensajes:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * EJEMPLO 1: Enviar múltiples mensajes al mismo teléfono/app
 * (Todos tendrán el mismo chatId)
 */
async function ejemplo1_MismoChat() {
  console.log('\n=== EJEMPLO 1: Mensajes del mismo chat ===\n');

  const phone = '+59178111111';
  const app = 'UNIA';

  // Enviar varios mensajes
  const msg1 = await enviarMensaje(phone, app, 'Código: 123456', 1);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const msg2 = await enviarMensaje(phone, app, 'Tu solicitud fue aprobada', 2);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const msg3 = await enviarMensaje(phone, app, 'Código: 789012', 1);

  // Verificar que todos tienen el mismo chatId
  console.log(`\n📌 Todos los mensajes tienen chatId: ${msg1.chatId}`);
  console.log(`   msg1.chatId === msg2.chatId: ${msg1.chatId === msg2.chatId}`);
  console.log(`   msg2.chatId === msg3.chatId: ${msg2.chatId === msg3.chatId}`);

  // Obtener historial del chat
  await obtenerMensajesPorChat(msg1.chatId);
}

/**
 * EJEMPLO 2: Mensajes de diferentes chats
 * (Diferente teléfono = diferente chatId)
 */
async function ejemplo2_DiferentesChats() {
  console.log('\n=== EJEMPLO 2: Mensajes de diferentes chats ===\n');

  const app = 'UNIA';

  // Enviar a diferentes números
  const msg1 = await enviarMensaje('+59178111111', app, 'Código para usuario 1: 111111', 1);
  const msg2 = await enviarMensaje('+59178222222', app, 'Código para usuario 2: 222222', 1);
  const msg3 = await enviarMensaje('+59178333333', app, 'Código para usuario 3: 333333', 1);

  console.log(`\n📌 Cada usuario tiene su propio chatId:`);
  console.log(`   Usuario 1: ${msg1.chatId}`);
  console.log(`   Usuario 2: ${msg2.chatId}`);
  console.log(`   Usuario 3: ${msg3.chatId}`);
  console.log(`   ¿Todos diferentes?: ${msg1.chatId !== msg2.chatId && msg2.chatId !== msg3.chatId}`);
}

/**
 * EJEMPLO 3: Mismo teléfono, diferentes apps
 * (chatId diferente por app diferente)
 */
async function ejemplo3_MismoTelefonoDiferentesApps() {
  console.log('\n=== EJEMPLO 3: Mismo teléfono en diferentes apps ===\n');

  const phone = '+59178999999';

  const msgUNIA = await enviarMensaje(phone, 'UNIA', 'Código UNIA: 111', 1);
  const msgAPP2 = await enviarMensaje(phone, 'MiApp', 'Código MiApp: 222', 1);
  const msgAPP3 = await enviarMensaje(phone, 'OtraApp', 'Código OtraApp: 333', 1);

  console.log(`\n📌 Mismo número, diferentes chatIds por app:`);
  console.log(`   UNIA chatId:    ${msgUNIA.chatId}`);
  console.log(`   MiApp chatId:   ${msgAPP2.chatId}`);
  console.log(`   OtraApp chatId: ${msgAPP3.chatId}`);
  console.log(`   ¿Todos diferentes?: ${msgUNIA.chatId !== msgAPP2.chatId && msgAPP2.chatId !== msgAPP3.chatId}`);
}

/**
 * EJEMPLO 4: Prevención de spam
 * Verificar cuántos mensajes tiene un chat antes de enviar
 */
async function ejemplo4_PrevencionSpam() {
  console.log('\n=== EJEMPLO 4: Prevención de spam ===\n');

  const phone = '+59178444444';
  const app = 'UNIA';

  // Enviar primer mensaje
  const primerMsg = await enviarMensaje(phone, app, 'Primer código: 111111', 1);
  const chatId = primerMsg.chatId;

  // Verificar historial
  const historial = await obtenerMensajesPorChat(chatId);

  // Política de ejemplo: máximo 5 mensajes por hora
  const limiteSpam = 5;
  const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);

  const mensajesRecientes = historial.filter(
    (msg: any) => new Date(msg.createdAt) > unaHoraAtras
  );

  console.log(`\n⚠️ Verificación anti-spam:`);
  console.log(`   Mensajes en la última hora: ${mensajesRecientes.length}`);
  console.log(`   Límite permitido: ${limiteSpam}`);

  if (mensajesRecientes.length >= limiteSpam) {
    console.log(`   ❌ BLOQUEADO: El usuario ha excedido el límite de mensajes`);
  } else {
    console.log(`   ✅ OK: El usuario puede recibir más mensajes`);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando ejemplos de ChatId...\n');

  try {
    // Ejecutar ejemplos
    await ejemplo1_MismoChat();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await ejemplo2_DiferentesChats();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await ejemplo3_MismoTelefonoDiferentesApps();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await ejemplo4_PrevencionSpam();

    console.log('\n✅ Todos los ejemplos completados exitosamente');
  } catch (error) {
    console.error('\n❌ Error en los ejemplos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
