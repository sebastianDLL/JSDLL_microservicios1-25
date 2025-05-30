// Script de inicialización para MongoDB
// Este script se ejecuta automáticamente cuando se crea el contenedor

// Crear la base de datos eventos_db
db = db.getSiblingDB('eventos_db');

// Crear colecciones con algunos datos de ejemplo
db.events.insertMany([
  {
    id: 1,
    nombre: "Concierto de Rock",
    fecha: "2024-12-15T20:00:00Z",
    lugar: "Estadio Nacional",
    capacidad: 1000,
    precio: "75.00",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    nombre: "Festival de Jazz",
    fecha: "2024-12-20T19:00:00Z",
    lugar: "Teatro Municipal",
    capacidad: 500,
    precio: "50.00",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    nombre: "Obra de Teatro",
    fecha: "2024-12-25T21:00:00Z",
    lugar: "Teatro Nacional",
    capacidad: 200,
    precio: "30.00",
    created_at: new Date(),
    updated_at: new Date()
  }
]);
