CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    habitacion_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    estado VARCHAR(20) NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL
);

INSERT INTO reservas (habitacion_id, usuario_id, fecha_entrada, fecha_salida, estado, monto_total)
VALUES 
(1, 1, '2025-06-10', '2025-06-15', 'confirmada', 750.00),
(2, 2, '2025-06-12', '2025-06-14', 'pendiente', 300.00),
(3, 3, '2025-06-15', '2025-06-20', 'cancelada', 1000.00);