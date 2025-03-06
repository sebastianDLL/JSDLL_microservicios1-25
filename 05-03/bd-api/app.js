const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path=require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = 3000;

// Configurar middleware
app.use(cors());
app.use(bodyParser.json()); // Permite recibir JSON en las peticiones

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Cambia según tu configuración
  password: '',      // Cambia según tu configuración
  database: 'bd_ventas'
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a la BD:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

// **Rutas del CRUD** 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

});

// 🔍 Obtener todos los productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// 🔍 Obtener un producto por ID
app.get('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results[0] || {}); // Retorna el producto o un objeto vacío
  });
});

//  Agregar un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;
  db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Producto agregado', id: result.insertId });
    }
  );
});

//  Actualizar un producto
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  db.query('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, id],
    (err, result) => {
      if (err) throw err;
      res.json({ message: 'Producto actualizado' });
    }
  );
});

//  Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Producto eliminado' });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
