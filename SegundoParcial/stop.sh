#!/bin/bash

# Script para detener el sistema completo de microservicios del hotel
echo "🛑 DETENIENDO SISTEMA DE MICROSERVICIOS HOTEL"
echo "============================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Mostrar contenedores activos antes de detener
echo "📊 Contenedores activos:"
docker-compose ps

echo ""
print_status "Deteniendo servicios..."

# Detener servicios manteniendo los datos
if docker-compose down; then
    print_status "Servicios detenidos correctamente ✓"
else
    print_warning "Algunos servicios podrían no haberse detenido correctamente"
fi

# Opción para limpiar todo (incluyendo volúmenes)
echo ""
read -p "¿Deseas eliminar también los datos de las bases de datos? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Eliminando volúmenes de datos..."
    docker-compose down -v
    print_status "Datos eliminados ✓"
else
    print_status "Datos preservados ✓"
fi

# Mostrar estado final
echo ""
echo "📋 ESTADO FINAL:"
echo "================"
docker-compose ps

echo ""
print_status "Sistema detenido correctamente 🏁"
echo ""
echo "Para volver a iniciar:"
echo "  ./start.sh"
echo ""
echo "Para iniciar manualmente:"
echo "  docker-compose up -d"