const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // <-- Nueva librería

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

const SECRET_KEY = 'CruzAzul_MFA_Token_2026';

// ==========================================
// CONFIGURACIÓN CORREOS Y MFA
// ==========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pilar.a2a0@gmail.com', // <-- PON TU CORREO ACÁ
        pass: 'mfhx plaj lpov byrt' // <-- MÁS ABAJO TE EXPLICO ESTA CLAVE
    }
});

// Almacén temporal en memoria para el código de seguridad
let mfaStore = {}; 

// Paso 1: Validar credenciales y enviar correo
app.post('/login-step1', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        // Generar PIN aleatorio de 6 dígitos
        const codigoMFA = Math.floor(100000 + Math.random() * 900000).toString();
        mfaStore[username] = codigoMFA;
        
        console.log(`[MFA] Código generado para ${username}: ${codigoMFA}`); // Respaldo en consola

        try {
            await transporter.sendMail({
                from: '"Seguridad Cruz Azul" <pilar.a2a0@gmail.com>',
                to: 'pilar.a2a0@gmail.com', // A dónde quieres que llegue el código
                subject: 'Tu código de acceso MFA - Cruz Azul',
                html: `<h3>Acceso Administrativo</h3><p>Tu código de seguridad es: <b>${codigoMFA}</b></p><p>Válido por 5 minutos.</p>`
            });
            res.json({ mensaje: 'Código enviado al correo' });
        } catch (error) {
            console.error('Error al enviar correo:', error);
            res.status(500).json({ error: 'Error al enviar el correo, pero revisa la consola (logs) para ver el código.' });
        }
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

// Paso 2: Validar PIN y entregar el Token
app.post('/login-step2', (req, res) => {
    const { username, mfa } = req.body;
    
    if (mfaStore[username] && mfaStore[username] === mfa) {
        delete mfaStore[username]; // Borramos el código por seguridad
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
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
});

app.post('/productos', verificarToken, async (req, res) => {
    const { nombre, precio, stock } = req.body;
    const result = await pool.query(
        'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
        [nombre, precio, stock]
    );
    res.status(201).json(result.rows[0]);
});

// <-- NUEVO: EDITAR PRODUCTOS
app.put('/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query(
            'UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4',
            [nombre, precio, stock, id]
        );
        res.json({ mensaje: 'Producto actualizado con éxito' });
    } catch (err) {
        res.status(500).send('Error al actualizar');
    }
});

app.delete('/productos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.status(204).send();
});

app.listen(port, () => console.log(`Servidor corriendo en el puerto ${port}`));
