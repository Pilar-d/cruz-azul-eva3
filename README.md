# Proyecto ERP: Modernización Farmacias Cruz Azul

## 1. Descripción
Este proyecto consiste en la modernización del sistema ERP de Farmacias Cruz Azul mediante una arquitectura cloud sobre **AWS**. El objetivo es migrar de un modelo CAPEX de alta inversión a un modelo OPEX eficiente, garantizando alta disponibilidad, seguridad de red y automatización de respaldos.

## 2. Arquitectura del Proyecto
La solución utiliza contenedores orquestados para asegurar portabilidad y escalabilidad:
* **Frontend/App:** Aplicación Node.js desplegada en contenedores Docker.
* **Base de Datos:** AWS RDS (PostgreSQL v18.3) con acceso segmentado.
* **Infraestructura:** Despliegue en AWS EC2 (Ubuntu 24.04).



## 3. Análisis Financiero (TCO Anual)
Tras evaluar AWS, Azure y Oracle, se seleccionó AWS por su robustez y costo ajustado al presupuesto:
* **Presupuesto:** 2.000 USD (1.880.000 CLP).
* **Costo AWS:** 1.440 USD (1.353.600 CLP).
* **Margen de Resguardo:** 560 USD (526.400 CLP), destinado a escalabilidad operativa.

## 4. Gestión de Proyecto y Resultados
El despliegue se completó en un ciclo de 7 días (10-17 junio 2026) bajo una metodología ágil con roles rotativos:
* **Seguridad:** Implementación de *Security Groups* basados en referencia de ID, eliminando dependencias de IPs estáticas.
* **Automatización:** Se integró el script `backup_db.sh` para respaldos diarios automatizados hacia un bucket S3 privado, asegurando la integridad de los datos.

## 5. Instrucciones de Despliegue
Para levantar el entorno, asegúrese de tener configuradas las variables de entorno en el archivo `.env`:

```bash
# Variables necesarias
DB_HOST=tu_endpoint_rds
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_bd
