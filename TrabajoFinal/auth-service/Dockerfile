FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Instala el cliente de MySQL para wait-for-db.sh
RUN apt-get update && apt-get install -y default-mysql-client

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]