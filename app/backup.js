const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const { execSync } = require("child_process");

// Configuración de AWS y Base de Datos
const BUCKET_NAME = "cruz-azul-backups-inacap-2026";
const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });

async function realizarBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `/tmp/backup-${timestamp}.sql`;

    try {
        console.log("Iniciando pg_dump...");
                execSync(`docker run --rm -e PGPASSWORD='${process.env.DB_PASSWORD}' postgres:17 pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} --sslmode=require > ${fileName}`);
                env: { 
                ...process.env, 
                PGPASSWORD: process.env.DB_PASSWORD,
                PGSSLMODE: 'require' 
             },
             stdio: 'inherit'
        });	 

        console.log("Subiendo a S3...");
        const fileContent = fs.readFileSync(fileName);
        
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `backups/backup-${timestamp}.sql`,
            Body: fileContent
        }));

        console.log("¡Backup exitoso!");
        
        // Limpiar archivo temporal del sistema
        fs.unlinkSync(fileName);
        
    } catch (error) {
        console.error("Error crítico en el proceso de backup:", error);
        process.exit(1);
    }
}

realizarBackup();
