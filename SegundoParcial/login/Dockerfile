FROM node:18-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorio para logs
RUN mkdir -p /app/logs

# Exponer el puerto
EXPOSE 3000

# Script de inicio que espera a la base de datos
COPY wait-for-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Comando para iniciar la aplicación
CMD ["wait-for-db.sh", "npm", "start"]