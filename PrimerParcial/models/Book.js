const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  editorial: String,
  año: Number,
  descripcion: String,
  numero_pagina: Number,
});

module.exports = mongoose.model('Book', bookSchema);