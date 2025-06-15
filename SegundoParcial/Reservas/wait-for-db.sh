#!/bin/sh

echo "🔄 Waiting for PostgreSQL to be ready..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo "🔧 Initializing database..."

# Ejecutar script de inicialización
node scripts/initDatabase.js

echo "🚀 Starting GraphQL server..."

exec "$@"