require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Book = require('./models/Book');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

app.get('/libro', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

app.post('/libro', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear libro' });
  }
});

app.put('/libro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ error: 'Libro no encontrada' });
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar libro' });
  }
});

app.delete('/libro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) return res.status(404).json({ error: 'Libro no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar libro' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
