#!/bin/sh

# Script para esperar a que PostgreSQL esté listo
echo "🔄 Waiting for PostgreSQL to be ready..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo "🚀 Starting Node.js application..."

# Ejecutar el comando pasado como argumentos
exec "$@"