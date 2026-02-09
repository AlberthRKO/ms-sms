# Guía de Integración ChatId - App Flutter

Esta guía explica cómo integrar el sistema de chatId en tu aplicación Flutter.

## 🎯 Conceptos Clave

### ¿Qué es chatId?

- Es un identificador único que agrupa mensajes de la misma conversación
- Se genera automáticamente: MD5(teléfono + app)
- Mismo usuario + misma app = mismo chatId
- Diferente app o usuario = diferente chatId

### Ventajas para tu App

1. **Organización**: Agrupa mensajes en conversaciones
2. **Anti-spam**: Detecta usuarios que reciben muchos mensajes
3. **Historial**: Consulta todos los mensajes de una conversación
4. **Performance**: Menos eventos WebSocket (bug corregido)

---

## 📱 Ejemplo de UI

### Antes (sin chatId)

```
📬 Mensajes SMS
├─ Código: 123456 - +59178111111 - 10:30
├─ Tu solicitud fue aprobada - +59178111111 - 10:32
├─ Código: 789012 - +59178111111 - 10:35
├─ Código: 456789 - +59178222222 - 10:40
└─ Bienvenido - +59178222222 - 10:41

❌ Problema: Difícil saber qué mensajes son de la misma conversación
```

### Después (con chatId)

```
💬 Conversaciones
├─ 📱 +591 78111111 (chatId: a1b2c3d4)
│  ├─ Código: 123456 - 10:30
│  ├─ Tu solicitud fue aprobada - 10:32
│  └─ Código: 789012 - 10:35
│
└─ 📱 +591 78222222 (chatId: x9y8z7w6)
   ├─ Código: 456789 - 10:40
   └─ Bienvenido - 10:41

✅ Solución: Mensajes agrupados por conversación
```

---

## 🔧 Implementación Flutter

### 1. Modelo de Datos

```dart
class SmsMessage {
  final String id;
  final String chatId; // 👈 NUEVO CAMPO
  final String phone;
  final String message;
  final String app;
  final int messageType;
  final int status;
  final DateTime createdAt;

  SmsMessage({
    required this.id,
    required this.chatId, // 👈 NUEVO CAMPO
    required this.phone,
    required this.message,
    required this.app,
    required this.messageType,
    required this.status,
    required this.createdAt,
  });

  factory SmsMessage.fromJson(Map<String, dynamic> json) {
    return SmsMessage(
      id: json['_id'] ?? json['messageId'],
      chatId: json['chatId'], // 👈 PARSEAR CAMPO
      phone: json['phone'],
      message: json['message'],
      app: json['app'],
      messageType: json['messageType'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
```

### 2. Servicio API

```dart
class SmsService {
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3515/v1/sms'));

  // Enviar mensaje (ahora retorna chatId automáticamente)
  Future<SmsMessage> sendMessage({
    required String phone,
    required String message,
    required String app,
    required int messageType,
  }) async {
    final response = await _dio.post('/send-message', data: {
      'mode': 'prod',
      'phone': phone,
      'message': message,
      'app': app,
      'messageType': messageType,
      'user': {
        'ci': '12345678',
        'nombreCompleto': 'Usuario App',
      },
    });

    return SmsMessage.fromJson(response.data['response']['data']);
  }

  // 👈 NUEVO: Obtener mensajes de un chat específico
  Future<List<SmsMessage>> getMessagesByChatId(String chatId) async {
    final response = await _dio.get('/messages/chat/$chatId');

    final List<dynamic> data = response.data['response']['data'];
    return data.map((json) => SmsMessage.fromJson(json)).toList();
  }

  // Obtener todos los mensajes (ahora incluyen chatId)
  Future<List<SmsMessage>> getAllMessages({
    int? messageType,
    int? status,
    String? app,
  }) async {
    final response = await _dio.get('/messages', queryParameters: {
      if (messageType != null) 'messageType': messageType,
      if (status != null) 'status': status,
      if (app != null) 'app': app,
    });

    final List<dynamic> data = response.data['response']['data'];
    return data.map((json) => SmsMessage.fromJson(json)).toList();
  }
}
```

### 3. Agrupar Mensajes por ChatId

```dart
class MessageGrouper {
  // Agrupar lista de mensajes por chatId
  static Map<String, List<SmsMessage>> groupByChatId(List<SmsMessage> messages) {
    final Map<String, List<SmsMessage>> grouped = {};

    for (final message in messages) {
      if (!grouped.containsKey(message.chatId)) {
        grouped[message.chatId] = [];
      }
      grouped[message.chatId]!.add(message);
    }

    // Ordenar mensajes dentro de cada grupo por fecha
    grouped.forEach((chatId, messages) {
      messages.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    });

    return grouped;
  }

  // Obtener información del chat (primer mensaje)
  static ChatInfo getChatInfo(List<SmsMessage> chatMessages) {
    final firstMessage = chatMessages.first;
    return ChatInfo(
      chatId: firstMessage.chatId,
      phone: firstMessage.phone,
      app: firstMessage.app,
      messageCount: chatMessages.length,
      lastMessage: chatMessages.first.message,
      lastMessageDate: chatMessages.first.createdAt,
    );
  }
}

class ChatInfo {
  final String chatId;
  final String phone;
  final String app;
  final int messageCount;
  final String lastMessage;
  final DateTime lastMessageDate;

  ChatInfo({
    required this.chatId,
    required this.phone,
    required this.app,
    required this.messageCount,
    required this.lastMessage,
    required this.lastMessageDate,
  });
}
```

### 4. Estado con Riverpod/Provider

```dart
// Provider de mensajes
final messagesProvider = FutureProvider<List<SmsMessage>>((ref) async {
  final service = SmsService();
  return await service.getAllMessages();
});

// Provider de mensajes agrupados
final groupedMessagesProvider = Provider<Map<String, List<SmsMessage>>>((ref) {
  final messages = ref.watch(messagesProvider).value ?? [];
  return MessageGrouper.groupByChatId(messages);
});

// Provider de chats
final chatsProvider = Provider<List<ChatInfo>>((ref) {
  final grouped = ref.watch(groupedMessagesProvider);

  return grouped.entries.map((entry) {
    return MessageGrouper.getChatInfo(entry.value);
  }).toList()
    ..sort((a, b) => b.lastMessageDate.compareTo(a.lastMessageDate));
});

// Provider de mensajes de un chat específico
final chatMessagesProvider = FutureProvider.family<List<SmsMessage>, String>(
  (ref, chatId) async {
    final service = SmsService();
    return await service.getMessagesByChatId(chatId);
  },
);
```

### 5. Widget de Lista de Chats

```dart
class ChatsListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chats = ref.watch(chatsProvider);

    return Scaffold(
      appBar: AppBar(title: Text('Conversaciones SMS')),
      body: ListView.builder(
        itemCount: chats.length,
        itemBuilder: (context, index) {
          final chat = chats[index];

          return ListTile(
            leading: CircleAvatar(
              child: Text(chat.messageCount.toString()),
            ),
            title: Text(chat.phone),
            subtitle: Text(
              chat.lastMessage,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  _formatTime(chat.lastMessageDate),
                  style: TextStyle(fontSize: 12),
                ),
                SizedBox(height: 4),
                Text(
                  chat.app,
                  style: TextStyle(fontSize: 10, color: Colors.grey),
                ),
              ],
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ChatDetailScreen(chatId: chat.chatId),
                ),
              );
            },
          );
        },
      ),
    );
  }

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) return 'Ahora';
    if (difference.inHours < 1) return '${difference.inMinutes}m';
    if (difference.inDays < 1) return '${difference.inHours}h';
    return '${difference.inDays}d';
  }
}
```

### 6. Widget de Detalle de Chat

```dart
class ChatDetailScreen extends ConsumerWidget {
  final String chatId;

  const ChatDetailScreen({required this.chatId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messagesAsync = ref.watch(chatMessagesProvider(chatId));

    return Scaffold(
      appBar: AppBar(
        title: Text('Conversación'),
        actions: [
          IconButton(
            icon: Icon(Icons.info_outline),
            onPressed: () => _showChatInfo(context, ref),
          ),
        ],
      ),
      body: messagesAsync.when(
        data: (messages) => ListView.builder(
          reverse: true,
          itemCount: messages.length,
          itemBuilder: (context, index) {
            final message = messages[index];
            return _MessageBubble(message: message);
          },
        ),
        loading: () => Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  void _showChatInfo(BuildContext context, WidgetRef ref) {
    final messages = ref.read(chatMessagesProvider(chatId)).value ?? [];
    if (messages.isEmpty) return;

    final info = MessageGrouper.getChatInfo(messages);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Información del Chat'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chat ID: ${info.chatId}'),
            SizedBox(height: 8),
            Text('Teléfono: ${info.phone}'),
            SizedBox(height: 8),
            Text('Aplicación: ${info.app}'),
            SizedBox(height: 8),
            Text('Total mensajes: ${info.messageCount}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final SmsMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _getStatusColor(),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.message,
                style: TextStyle(color: Colors.white),
              ),
              SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _formatDate(message.createdAt),
                    style: TextStyle(color: Colors.white70, fontSize: 10),
                  ),
                  SizedBox(width: 8),
                  Icon(
                    _getStatusIcon(),
                    size: 12,
                    color: Colors.white70,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor() {
    switch (message.status) {
      case 0: return Colors.grey;    // Pendiente
      case 1: return Colors.green;   // Enviado
      case 2: return Colors.red;     // Fallido
      default: return Colors.grey;
    }
  }

  IconData _getStatusIcon() {
    switch (message.status) {
      case 0: return Icons.access_time;     // Pendiente
      case 1: return Icons.check_circle;    // Enviado
      case 2: return Icons.error;           // Fallido
      default: return Icons.help;
    }
  }

  String _formatDate(DateTime date) {
    return '${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
```

### 7. WebSocket Integration (Ahora sin eventos duplicados)

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket socket;

  void connect() {
    socket = IO.io('http://localhost:3515', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    // ✅ Evento cuando se crea un mensaje nuevo
    socket.on('send-message', (data) {
      print('✅ Nuevo mensaje: ${data['message']}');
      print('   ChatId: ${data['chatId']}'); // 👈 NUEVO CAMPO

      // Actualizar UI
      _handleNewMessage(SmsMessage.fromJson(data));
    });

    // ✅ Evento cuando se actualiza el estado
    // ⚠️ AHORA SOLO SE EMITE CUANDO SE ACTUALIZA MANUALMENTE
    socket.on('send-message-status', (data) {
      print('✅ Estado actualizado: ${data['status']}');

      // Actualizar UI
      _handleStatusUpdate(data['messageId'], data['status']);
    });

    socket.connect();
  }

  void _handleNewMessage(SmsMessage message) {
    // Agregar a la lista de mensajes
    // Actualizar chat correspondiente
    // Mostrar notificación
  }

  void _handleStatusUpdate(String messageId, int newStatus) {
    // Actualizar solo el estado del mensaje
    // No duplicar el mensaje
  }

  void disconnect() {
    socket.disconnect();
  }
}
```

---

## 🛡️ Anti-Spam Implementation

```dart
class SpamDetector {
  static const int MAX_MESSAGES_PER_HOUR = 5;

  // Verificar si un chat está enviando spam
  static Future<bool> isSpamming(String chatId, SmsService service) async {
    final messages = await service.getMessagesByChatId(chatId);

    final oneHourAgo = DateTime.now().subtract(Duration(hours: 1));
    final recentMessages = messages.where(
      (msg) => msg.createdAt.isAfter(oneHourAgo)
    ).toList();

    return recentMessages.length >= MAX_MESSAGES_PER_HOUR;
  }

  // Widget de advertencia de spam
  static Widget buildSpamWarning(int messageCount) {
    if (messageCount < MAX_MESSAGES_PER_HOUR) return SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(12),
      margin: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.orange),
      ),
      child: Row(
        children: [
          Icon(Icons.warning, color: Colors.orange),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              '⚠️ Este usuario ha recibido $messageCount mensajes en la última hora',
              style: TextStyle(color: Colors.orange.shade900),
            ),
          ),
        ],
      ),
    );
  }
}

// Uso en el widget de detalle
class ChatDetailScreen extends ConsumerWidget {
  // ... código anterior ...

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messagesAsync = ref.watch(chatMessagesProvider(chatId));

    return messagesAsync.when(
      data: (messages) {
        final oneHourAgo = DateTime.now().subtract(Duration(hours: 1));
        final recentCount = messages.where(
          (msg) => msg.createdAt.isAfter(oneHourAgo)
        ).length;

        return Column(
          children: [
            SpamDetector.buildSpamWarning(recentCount), // 👈 ADVERTENCIA
            Expanded(
              child: ListView.builder(/* ... */),
            ),
          ],
        );
      },
      // ... resto del código ...
    );
  }
}
```

---

## 📊 Estadísticas por Chat

```dart
class ChatStats {
  final String chatId;
  final int totalMessages;
  final int pendingMessages;
  final int sentMessages;
  final int failedMessages;
  final DateTime? firstMessageDate;
  final DateTime? lastMessageDate;

  ChatStats({
    required this.chatId,
    required this.totalMessages,
    required this.pendingMessages,
    required this.sentMessages,
    required this.failedMessages,
    this.firstMessageDate,
    this.lastMessageDate,
  });

  factory ChatStats.fromMessages(List<SmsMessage> messages) {
    return ChatStats(
      chatId: messages.first.chatId,
      totalMessages: messages.length,
      pendingMessages: messages.where((m) => m.status == 0).length,
      sentMessages: messages.where((m) => m.status == 1).length,
      failedMessages: messages.where((m) => m.status == 2).length,
      firstMessageDate: messages.last.createdAt,
      lastMessageDate: messages.first.createdAt,
    );
  }
}

// Widget de estadísticas
class ChatStatsWidget extends StatelessWidget {
  final ChatStats stats;

  const ChatStatsWidget({required this.stats});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Estadísticas', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            _StatRow(label: 'Total', value: '${stats.totalMessages}', color: Colors.blue),
            _StatRow(label: 'Enviados', value: '${stats.sentMessages}', color: Colors.green),
            _StatRow(label: 'Pendientes', value: '${stats.pendingMessages}', color: Colors.orange),
            _StatRow(label: 'Fallidos', value: '${stats.failedMessages}', color: Colors.red),
          ],
        ),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatRow({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              value,
              style: TextStyle(color: color, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## ✅ Checklist de Integración

- [ ] Actualizar modelo `SmsMessage` con campo `chatId`
- [ ] Agregar método `getMessagesByChatId()` al servicio
- [ ] Crear función para agrupar mensajes por `chatId`
- [ ] Implementar vista de lista de chats
- [ ] Implementar vista de detalle de chat
- [ ] Actualizar manejo de WebSocket (ya no hay eventos duplicados)
- [ ] Implementar detector de spam
- [ ] Agregar estadísticas por chat
- [ ] Probar flujo completo

---

## 🎉 Resultado Final

Tu app ahora tendrá:

- ✅ Mensajes organizados por conversación
- ✅ Detección automática de spam
- ✅ Historial completo por chat
- ✅ Sin eventos WebSocket duplicados
- ✅ UI más limpia y profesional
- ✅ Mejor performance

**¡Listo para integrar!** 🚀
