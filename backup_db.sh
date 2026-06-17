#!/bin/bash

# 1. Cargar las variables desde el archivo .env
# Esto asegura que el script conozca el DB_HOST, DB_USER, DB_PASSWORD y DB_NAME
if [ -f /srv/cruz_azul-erp/.env ]; then
  source /srv/cruz_azul-erp/.env
else
  echo "Error: Archivo .env no encontrado."
  exit 1
fi

# 2. Exportar PGPASSWORD para que pg_dump lo use automáticamente
export PGPASSWORD=$DB_PASSWORD

# 3. Definir variables de tiempo y archivo
DATE=$(date +%Y%m%d_%H%M%S)
FILE=/tmp/backup_$DATE.sql

# 4. Realizar el dump de la base de datos
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $FILE

# 5. Validar si el dump fue exitoso y subir a S3
if [ $? -eq 0 ]; then
    echo "Dump realizado, subiendo a S3..."
    aws s3 cp $FILE s3://cruz-azul-backups-inacap-2026/backups/backup_$DATE.sql
    echo "Respaldo subido correctamente."
else
    echo "Error en el respaldo de la base de datos."
    rm $FILE
    exit 1
fi

# 6. Limpiar archivo temporal
rm $FILE
