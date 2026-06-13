FROM node:18-alpine
WORKDIR /usr/src/app
# Copiar primero los package para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install
# Copiar el resto del código
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]