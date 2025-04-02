const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: true }));  // Para poder leer los datos de un formulario

app.set('view engine', 'ejs'); // Configurar EJS como motor de plantillas
app.use(express.static('public')); // Servir archivos estáticos

app.get('/', (req, res) => {
    res.sendFile('bienvenido.html', { root: __dirname + '/public' });
});
app.get('/listar', (req, res) => {
    db.query('SELECT id,nombre,correo_electronico,fecha_registro FROM usuarios', (error, usuarios) => {
        if (error) {
            console.log('Error al ejecutar la consulta');
            return;
        }
        res.render('listar', { usuarios });
    });
});
// Mostrar formulario para agregar producto
app.get('/add', (req, res) => {
    res.render('add');
  });
 //Guardar el producto en la base de datos
app.post('/add', (req, res) => {
    const { nombre, correo_electronico } = req.body;
    db.query('INSERT INTO usuarios (nombre, correo_electronico) VALUES (?, ?)', [nombre, correo_electronico], (error, resultado) => {
        if (error) {
            console.log('Error al insertar el producto');
            return;
        }
        res.redirect('/listar');
    }); 
});
// Mostrar formulario para editar producto
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT id, nombre, correo_electronico FROM usuarios WHERE id = ?', [id], (error, usuarios) => {
        if (error) {
            console.log('Error al ejecutar la consulta');
            return;
        }
        res.render('edit', { usuario: usuarios[0] });
    });
});

// Eliminar producto
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM usuarios WHERE id = ?', [id], (error, resultado) => {
        if (error) {
            console.log('Error al eliminar el usuario');
            return;
        }
        res.redirect('/listar');
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// ejecutar docker-compose up -d --build