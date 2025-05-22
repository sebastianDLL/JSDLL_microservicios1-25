use mongodb::bson::oid::ObjectId; // Importa el tipo ObjectId de la biblioteca de MongoDB para manejar identificadores únicos.
use serde::{Deserialize, Serialize}; // Importa las macros Serialize y Deserialize para serialización y deserialización.

#[derive(Debug, Serialize, Deserialize)] // Deriva las implementaciones de Debug, Serialize y Deserialize para la estructura.
pub struct Book {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")] // Renombra el campo `id` como `_id` al serializar y omite si es None.
    pub id: Option<ObjectId>, // Identificador único opcional del libro (usado en MongoDB).
    pub titulo: String, // Título del libro.
    pub autor: String, // Autor del libro.
    pub editorial: String, // Editorial del libro.
    pub anio: i32, // Año de publicación del libro.
    pub descripcion: String, // Descripción del libro.
    pub numero_pagina: i32, // Número de páginas del libro.
}

#[derive(Debug, Serialize, Deserialize)] // Deriva las implementaciones de Debug, Serialize y Deserialize para la estructura.
pub struct CreateBookDto {
    pub titulo: String, // Título del libro (requerido para crear un libro).
    pub autor: String, // Autor del libro (requerido para crear un libro).
    pub editorial: String, // Editorial del libro (requerido para crear un libro).
    pub anio: i32, // Año de publicación del libro (requerido para crear un libro).
    pub descripcion: String, // Descripción del libro (requerido para crear un libro).
    pub numero_pagina: i32, // Número de páginas del libro (requerido para crear un libro).
}

#[derive(Debug, Serialize, Deserialize)] // Deriva las implementaciones de Debug, Serialize y Deserialize para la estructura.
pub struct UpdateBookDto {
    pub titulo: Option<String>, // Título del libro (opcional para actualizar un libro).
    pub autor: Option<String>, // Autor del libro (opcional para actualizar un libro).
    pub editorial: Option<String>, // Editorial del libro (opcional para actualizar un libro).
    pub anio: Option<i32>, // Año de publicación del libro (opcional para actualizar un libro).
    pub descripcion: Option<String>, // Descripción del libro (opcional para actualizar un libro).
    pub numero_pagina: Option<i32>, // Número de páginas del libro (opcional para actualizar un libro).
}