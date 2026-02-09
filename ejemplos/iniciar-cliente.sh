#!/bin/bash

# Script para iniciar el cliente WebSocket
# Uso: ./iniciar-cliente.sh

echo "🚀 Iniciando Cliente WebSocket SMS"
echo "===================================="
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

echo "🔌 Conectando al servidor WebSocket..."
echo "📡 URL: http://localhost:3515"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""
echo "===================================="
echo ""

# Ejecutar el cliente
npx tsx cliente-websocket.ts
