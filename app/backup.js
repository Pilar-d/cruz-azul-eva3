const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const { execSync } = require("child_process");

// Configuración
const BUCKET_NAME = "cruz-azul-backups-inacap-2026"; // CAMBIA ESTO
const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });

async function realizarBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `/tmp/backup-${timestamp}.sql`;

    // 1. Ejecutar el pg_dump
    console.log("Iniciando pg_dump...");
    execSync(`pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} > ${fileName}`);

    // 2. Subir a S3
    console.log("Subiendo a S3...");
    const fileContent = fs.readFileSync(fileName);
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `backups/backup-${timestamp}.sql`,
        Body: fileContent
    }));

    console.log("Backup exitoso!");
    fs.unlinkSync(fileName); // Limpiar
}

realizarBackup().catch(console.error);
