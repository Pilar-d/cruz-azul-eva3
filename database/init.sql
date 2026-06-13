CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad integer(50)  NOT NULL,
    precio INTEGER
);

INSERT INTO productos (nombre, cantidad, precio) VALUES 
('Paracetamol', 10, 1000),
('Ibuprofeno', 5, 2000);