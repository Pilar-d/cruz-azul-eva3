cat << 'EOF' > init.sql
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio INTEGER NOT NULL,
    stock INTEGER NOT NULL
);

INSERT INTO productos (nombre, precio, stock) VALUES
('Paracetamol 500mg', 1500, 50),
('Ibuprofeno 400mg', 2000, 8);
EOF
