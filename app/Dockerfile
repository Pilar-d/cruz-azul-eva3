FROM node:18-alpine

# Instalar dependencias del sistema necesarias para pg_dump y otros procesos
RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/app

# Copiar primero los package para aprovechar el caché de Docker
COPY package*.json ./

# Instalar las dependencias de Node
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
