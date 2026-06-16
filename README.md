# ERP Farmacias Cruz Azul (PoC) - Documentación Técnica

Este repositorio contiene la arquitectura, código y guías de despliegue para la modernización de la plataforma ERP de **Farmacias Cruz Azul**, 
migrando de una infraestructura local a un ecosistema seguro en la nube (AWS).

## 1. Descripción de la Problemática y Arquitectura
La infraestructura previa presentaba vulnerabilidades por falta de segmentación de red y no contaba con autenticación 
MFA. Hemos rediseñado la solución bajo un **modelo de capas** (Frontend en subred pública, Base de Datos en subred privada) para minimizar
la superficie de ataque.

## 2. Estructura del Proyecto
* **Ruta requerida:** `/srv/cruz_azul-erp/`

## 3. Base de Datos (PaaS)
* **Servicio:** AWS RDS PostgreSQL.
* **Conectividad:** Gestión mediante variables de entorno (`DB_HOST`, `DB_USER`) en el contenedor, permitiendo abstracción del endpoint RDS.

## 4. Frontend y Autenticación
* **Stack:** Node.js + Express.
* **Seguridad:** Portal de autenticación con acceso condicional basado en **tokens JWT**. Las rutas protegidas requieren validación previa
* del token. *

## 5. Estrategia de Respaldos (S3)
* **Automatización:** Script `backup.sh` ejecutado vía `cron` (diario).
* **Almacenamiento:** Bucket S3 con ACLs privadas. - REVISAR

## 6. Despliegue y Gestión del Stack
* **Construcción:** `docker-compose build`
* **Despliegue:** `docker-compose up -d`
* **Verificación:** `docker ps` para contenedores y `docker logs cruz_azul_app` para auditoría de conexión.
* **Detención:** `docker-compose down` para una limpieza segura de recursos.

## 7. Seguridad de Red (Security Groups)
* **EC2:** Puertos 80/443 abiertos únicamente para el balanceador/cliente.
* **RDS:** Regla `Ingress` limitada exclusivamente al Security Group del Frontend (Puerto 5432).

## 8. Ventajas Cloud (Well-Architected Framework)
1. **Fiabilidad:** Servicios gestionados (RDS) reducen fallos operativos.
2. **Seguridad:** Aislamiento de redes y gestión de identidades (IAM).
3. **Escalabilidad:** Capacidad de ajustar recursos según demanda sin hardware físico.

