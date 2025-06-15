FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Cambiar ownership de archivos
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Exponer puerto
EXPOSE 3002

# Comando de inicio
CMD ["node", "src/app.js"]