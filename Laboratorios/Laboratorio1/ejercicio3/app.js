const express = require('express');
const bodyParser = require('body-parser');
const conexion = require('./db');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    const result = await conexion.query('SELECT * FROM agendas ORDER BY id ASC');
    res.render('index', { contactos: result.rows });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', async (req, res) => {
    const { nombres, apellidos, direccion, telefono } = req.body;
    await conexion.query('INSERT INTO agendas (nombres, apellidos, direccion, telefono) VALUES ($1, $2, $3, $4)',
        [nombres, apellidos, direccion, telefono]);
    res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const result = await conexion.query('SELECT * FROM agendas WHERE id = $1', [id]);
    res.render('edit', { contacto: result.rows[0] });
});

app.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { nombres, apellidos, direccion, telefono } = req.body;
    await conexion.query('UPDATE agendas SET nombres = $1, apellidos = $2, direccion = $3, telefono = $4 WHERE id = $5',
        [nombres, apellidos, direccion, telefono, id]);
    res.redirect('/');
});

app.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await conexion.query('DELETE FROM agendas WHERE id = $1', [id]);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});