// Script de inicialización para MongoDB - habitaciones
db = db.getSiblingDB('habitaciones_db');

db.habitaciones.insertMany([
  {
    id: 1,
    numero_habitacion: 101,
    tipo_habitacion: "Simple",
    precio_noche: "50.00",
    estado: "Disponible",
    descripcion: "Habitación simple con cama individual"
  },
  {
    id: 2,
    numero_habitacion: 102,
    tipo_habitacion: "Doble",
    precio_noche: "80.00",
    estado: "Ocupada",
    descripcion: "Habitación doble con dos camas"
  },
  {
    id: 3,
    numero_habitacion: 201,
    tipo_habitacion: "Suite",
    precio_noche: "150.00",
    estado: "Disponible",
    descripcion: "Suite con vista al mar y jacuzzi"
  }
]);
