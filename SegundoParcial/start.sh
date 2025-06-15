#!/bin/bash

# Script para iniciar el sistema completo de microservicios del hotel
# Autor: Sistema Hotel Microservices
# Fecha: $(date)

echo "🏨 INICIANDO SISTEMA DE MICROSERVICIOS HOTEL"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    print_error "Docker no está ejecutándose. Por favor, inicia Docker y vuelve a intentar."
    exit 1
fi

print_status "Docker está ejecutándose ✓"

# Verificar que docker-compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose no está instalado. Por favor, instálalo y vuelve a intentar."
    exit 1
fi

print_status "docker-compose está disponible ✓"

# Verificar estructura de carpetas
print_header "Verificando estructura de carpetas..."
required_dirs=("login" "habitaciones" "reservas" "nginx")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        print_error "Falta la carpeta: $dir"
        exit 1
    fi
    print_status "Carpeta $dir existe ✓"
done

# Verificar archivos requeridos
print_header "Verificando archivos de configuración..."
required_files=("docker-compose.yml" "nginx/nginx.conf")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Falta el archivo: $file"
        exit 1
    fi
    print_status "Archivo $file existe ✓"
done

# Detener servicios existentes si están ejecutándose
print_header "Deteniendo servicios existentes..."
docker-compose down 2>/dev/null || true

# Limpiar contenedores huérfanos
print_status "Limpiando contenedores huérfanos..."
docker-compose down --remove-orphans 2>/dev/null || true

# Construir e iniciar servicios
print_header "Construyendo e iniciando servicios..."
print_status "Esto puede tomar varios minutos la primera vez..."

if docker-compose up --build -d; then
    print_status "Servicios iniciados correctamente ✓"
else
    print_error "Error al iniciar los servicios"
    exit 1
fi

# Esperar a que los servicios estén listos
print_header "Esperando a que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
print_header "Verificando estado de los servicios..."
docker-compose ps

# Verificar conectividad
print_header "Verificando conectividad..."

# Función para verificar endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
            print_status "$name está respondiendo ✓"
            return 0
        fi
        print_warning "$name no responde aún... intento $attempt/$max_attempts"
        sleep 5
        ((attempt++))
    done
    
    print_error "$name no está respondiendo después de $max_attempts intentos"
    return 1
}

# Verificar servicios principales
check_endpoint "http://localhost/health" "API Gateway"
check_endpoint "http://localhost/" "Página principal"

print_header "🎉 SISTEMA INICIADO CORRECTAMENTE"
echo ""
echo "📋 INFORMACIÓN DE ACCESO:"
echo "========================"
echo "🌐 Página principal:      http://localhost/"
echo "🔍 Health check:          http://localhost/health"
echo "🔐 Servicio de login:     http://localhost/auth/graphql"
echo "🏠 Servicio habitaciones: http://localhost/habitaciones/"
echo "📅 Servicio reservas:     http://localhost/reservas/graphql"
echo ""
echo "💾 BASES DE DATOS (acceso externo):"
echo "=================================="
echo "🐘 PostgreSQL Login:      localhost:5433"
echo "🍃 MongoDB Habitaciones:  localhost:27017"
echo "🐘 PostgreSQL Reservas:   localhost:5434"
echo ""
echo "📊 MONITOREO:"
echo "============"
echo "Para ver logs en tiempo real:"
echo "  docker-compose logs -f"
echo ""
echo "Para ver estado de contenedores:"
echo "  docker-compose ps"
echo ""
echo "Para detener todo:"
echo "  docker-compose down"
echo ""
print_status "¡Sistema listo para usar! 🚀"