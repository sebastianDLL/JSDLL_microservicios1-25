#!/bin/sh

host="$DB_HOST"
port="$DB_PORT"

until mysqladmin ping -h"$host" -P"$port" --silent; do
    echo "⏳ MySQL no está disponible - esperando"
    sleep 2
done

echo "✅ MySQL está disponible - ejecutando comando"
exec "$@"