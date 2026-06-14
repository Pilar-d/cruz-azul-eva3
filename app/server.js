const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Permite leer datos JSON
app.use(express.json()); 

// ¡AQUÍ ESTÁ LA CORRECCIÓN! Apunta directamente a tu carpeta public
app.use(express.static(path.join(__dirname, 'public'))); 

// Conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,

// configuracion de seguridad (RDS SSL)

    ssl: {
	rejectUnauthorized: true, // Fuerza a validar que sea un certificado real de AWS
        ca: fs.readFileSync(path.join(__dirname, 'global-bundle.pem')).toString(),

    },

});


// ==========================================
// RUTAS DE LA API (CRUD)
// ==========================================

app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/api/productos', async (req, res) => {
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query('INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3)', [nombre, precio, stock]);
        res.status(201).send('Producto creado exitosamente');
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query('UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4', [nombre, precio, stock, id]);
        res.status(200).send('Producto actualizado exitosamente');
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.status(200).send('Producto eliminado exitosamente');
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo impecable en el puerto ${port}`);
});
