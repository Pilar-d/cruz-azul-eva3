const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// 1. VALIDACIÓN DE VARIABLES DE ENTORNO
if (!process.env.DB_HOST) {
    console.error("ERROR CRÍTICO: La variable DB_HOST no está configurada.");
}

const pool = new Pool({
    host: process.env.DB_HOST || 'database-cruzazul.ciihvjvbtoq2.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'postgres_admin',
    password: process.env.DB_PASSWORD || 'CruzAzul2026',
    database: process.env.DB_NAME || 'databaseCruzAzul',
    port: parseInt(process.env.DB_PORT) || 5432,
    ssl: { rejectUnauthorized: false }
});

// Prueba la conexión al arrancar
pool.connect((err, client, done) => {
    if (err) return console.error('Error al conectar a RDS:', err.stack);
    console.log('Conexión exitosa a AWS RDS PostgreSQL');
    done();
});

const SECRET_KEY = 'CruzAzul_MFA_Token_2026';

// ==========================================
// CONFIGURACIÓN CORREOS Y MFA
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pilar.a2a0@gmail.com',
        pass: 'mfhx plaj lpov byrt'
    }
});

let mfaStore = {};

app.post('/login-step1', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        const codigoMFA = Math.floor(100000 + Math.random() * 900000).toString();
        mfaStore[username] = codigoMFA;
        console.log(`[MFA] Código generado para ${username}: ${codigoMFA}`);
        try {
            await transporter.sendMail({
                from: '"Seguridad Cruz Azul" <pilar.a2a0@gmail.com>',
                to: 'pilar.a2a0@gmail.com',
                subject: 'Tu código de acceso MFA - Cruz Azul',
                html: `<h3>Acceso Administrativo</h3><p>Tu código de seguridad es: <b>${codigoMFA}</b></p>`
            });
            res.json({ mensaje: 'Código enviado al correo' });
        } catch (error) {
            console.error('Error al enviar correo:', error);
            res.status(500).json({ error: 'Error al enviar correo' });
        }
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

app.post('/login-step2', (req, res) => {
    const { username, mfa } = req.body;
    if (mfaStore[username] && mfaStore[username] === mfa) {
        delete mfaStore[username];
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token: token });
    } else {
        res.status(401).json({ error: 'Código MFA incorrecto' });
    }
});

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Acceso denegado' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// ==========================================
// RUTAS CRUD
// ==========================================
app.get('/productos', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/productos', verificarToken, async (req, res) => {
    const { nombre, precio, stock } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio, stock]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query(
            'UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4',
            [nombre, precio, stock, id]
        );
        res.json({ mensaje: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/productos/:id', verificarToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
