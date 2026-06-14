// Obtener productos (GET)
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Error');
    }
});

// Crear producto (POST)
app.post('/api/productos', async (req, res) => {
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query('INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3)', [nombre, precio, stock]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send('Error');
    }
});

// Actualizar producto (PUT)
app.put('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    try {
        await pool.query('UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4', [nombre, precio, stock, id]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send('Error');
    }
});

// Eliminar producto (DELETE)
app.delete('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send('Error');
    }
});
