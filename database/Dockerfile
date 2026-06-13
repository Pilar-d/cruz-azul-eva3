FROM postgres:13-alpine
# Copia el script de inicialización; Postgres lo ejecuta al crear el contenedor
COPY init.sql /docker-entrypoint-initdb.d/