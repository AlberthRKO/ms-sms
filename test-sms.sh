#!/bin/bash

# Script de prueba para el Microservicio SMS
# Ejecutar: chmod +x test-sms.sh && ./test-sms.sh

BASE_URL="http://localhost:3515/v1/sms"

echo "🚀 Iniciando pruebas del Microservicio SMS"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Enviar SMS con código (Tipo 1)
echo -e "${BLUE}📝 Test 1: Enviar SMS con código (Tipo 1)${NC}"
RESPONSE1=$(curl -s -X POST "$BASE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "prod",
    "phone": "+59178945612",
    "message": "Tu código de verificación es: 123456",
    "app": "UNIA",
    "messageType": 1,
    "user": {
      "ci": "12345678",
      "nombreCompleto": "Juan Perez",
      "msPersonaId": 123
    }
  }')

echo "$RESPONSE1" | jq .
MESSAGE_ID_1=$(echo "$RESPONSE1" | jq -r '.response.data.messageId')
echo -e "${GREEN}✅ Mensaje creado con ID: $MESSAGE_ID_1${NC}"
echo ""

sleep 1

# Test 2: Enviar mensaje informativo (Tipo 2)
echo -e "${BLUE}📝 Test 2: Enviar mensaje informativo (Tipo 2)${NC}"
RESPONSE2=$(curl -s -X POST "$BASE_URL/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "prod",
    "phone": "+59176543210",
    "message": "Su audiencia ha sido programada para mañana a las 10:00 AM",
    "app": "Sistema Judicial",
    "messageType": 2,
    "user": {
      "ci": "87654321",
      "nombreCompleto": "Maria Rodriguez"
    }
  }')

echo "$RESPONSE2" | jq .
MESSAGE_ID_2=$(echo "$RESPONSE2" | jq -r '.response.data.messageId')
echo -e "${GREEN}✅ Mensaje creado con ID: $MESSAGE_ID_2${NC}"
echo ""

sleep 1

# Test 3: Actualizar estado del primer mensaje a ENVIADO
echo -e "${BLUE}📝 Test 3: Actualizar estado a ENVIADO${NC}"
curl -s -X POST "$BASE_URL/send-message/status" \
  -H "Content-Type: application/json" \
  -d "{
    \"messageId\": \"$MESSAGE_ID_1\",
    \"status\": 1
  }" | jq .
echo -e "${GREEN}✅ Estado actualizado${NC}"
echo ""

sleep 1

# Test 4: Listar todos los mensajes
echo -e "${BLUE}📝 Test 4: Listar todos los mensajes${NC}"
curl -s "$BASE_URL/messages?limit=10" | jq .
echo ""

sleep 1

# Test 5: Filtrar por tipo 1 (códigos)
echo -e "${BLUE}📝 Test 5: Filtrar mensajes con código (Tipo 1)${NC}"
curl -s "$BASE_URL/messages?messageType=1" | jq .
echo ""

sleep 1

# Test 6: Filtrar por estado ENVIADO
echo -e "${BLUE}📝 Test 6: Filtrar mensajes enviados${NC}"
curl -s "$BASE_URL/messages?status=1" | jq .
echo ""

sleep 1

# Test 7: Filtrar por aplicación
echo -e "${BLUE}📝 Test 7: Filtrar por aplicación UNIA${NC}"
curl -s "$BASE_URL/messages?app=UNIA" | jq .
echo ""

# Resumen
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Pruebas completadas exitosamente${NC}"
echo ""
echo -e "${YELLOW}📊 Resumen:${NC}"
echo "  - 2 mensajes creados"
echo "  - 1 mensaje tipo CÓDIGO (ID: $MESSAGE_ID_1)"
echo "  - 1 mensaje tipo INFORMATIVO (ID: $MESSAGE_ID_2)"
echo "  - 1 estado actualizado a ENVIADO"
echo ""
echo -e "${BLUE}💡 Próximos pasos:${NC}"
echo "  1. Abre ejemplos/monitor-websocket.html en tu navegador"
echo "  2. Ejecuta este script de nuevo para ver los mensajes en tiempo real"
echo "  3. Implementa tu app externa usando ejemplos/cliente-websocket.ts"
echo ""
echo "🌐 URLs útiles:"
echo "  - API: http://localhost:3515/v1/sms"
echo "  - Swagger: http://localhost:3515/api"
echo ""
