#!/bin/bash
# Configuración
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BUCKET_NAME="cruz-azul-backups-inacap-2026"
DB_HOST="database-cruzazul.ciihvjvbtoq2.us-east-1.rds.amazonaws.com"
DB_NAME="databaseCruzAzul"
DB_USER="postgres_admin"
export PGPASSWORD="databaseCruzAzul123"

# Generar backup
# Cambia tu línea de pg_dump por esta:
# Cambia tu línea de pg_dump por esta:
pg_dump "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER password=$PGPASSWORD sslmode=require" > /tmp/backup_$TIMESTAMP.sql

# Subir a S3 (requiere AWS CLI configurado)
aws s3 cp /tmp/backup_$TIMESTAMP.sql s3://$BUCKET_NAME/backups/

# Limpiar archivo temporal
rm /tmp/backup_$TIMESTAMP.sql
