use axum::{
    extract::{Path, State}, // Importa extractores para obtener parámetros de ruta y estado compartido
    Json, // Importa Json para manejar datos en formato JSON
};
use std::sync::Arc; // Importa Arc para manejar referencias compartidas seguras entre hilos
use mongodb::{
    bson::{doc, oid::ObjectId}, // Importa herramientas para manejar documentos BSON y ObjectId
    Client, // Cliente para interactuar con MongoDB
};
use serde_json::json; // Importa json para construir respuestas JSON

use crate::models::Book; // Importa el modelo Book definido en otro archivo

// Define un alias para el estado compartido que contiene el cliente de MongoDB
pub type AppState = Arc<Client>;

// Controlador para obtener todos los libros
pub async fn get_books(State(client): State<AppState>) -> Json<Vec<Book>> {
    let db = client.database("biblioteca"); // Obtiene la base de datos "biblioteca"
    let col = db.collection::<Book>("libros"); // Obtiene la colección "libros"

    let cursor = col.find(None, None).await.unwrap(); // Busca todos los documentos en la colección
    let results: Vec<Book> = cursor.try_collect().await.unwrap(); // Convierte los resultados en un vector de libros
    Json(results) // Devuelve los libros como JSON
}

// Controlador para crear un nuevo libro
pub async fn create_book(State(client): State<AppState>, Json(payload): Json<Book>) -> Json<Book> {
    let db = client.database("biblioteca"); // Obtiene la base de datos "biblioteca"
    let col = db.collection::<Book>("libros"); // Obtiene la colección "libros"

    let mut new_book = payload; // Crea un nuevo libro a partir del payload recibido
    new_book.id = Some(ObjectId::new()); // Genera un nuevo ObjectId para el libro

    col.insert_one(&new_book, None).await.unwrap(); // Inserta el nuevo libro en la colección

    Json(new_book) // Devuelve el libro creado como JSON
}

// Controlador para actualizar un libro existente
pub async fn update_book(
    State(client): State<AppState>, // Obtiene el cliente de MongoDB del estado compartido
    Path(id): Path<String>, // Obtiene el ID del libro desde la ruta
    Json(payload): Json<Book>, // Obtiene los datos actualizados del libro desde el cuerpo de la solicitud
) -> Json<serde_json::Value> {
    let db = client.database("biblioteca"); // Obtiene la base de datos "biblioteca"
    let col = db.collection::<Book>("libros"); // Obtiene la colección "libros"

    let oid = ObjectId::parse_str(id).unwrap(); // Convierte el ID de la ruta en un ObjectId
    let filter = doc! { "_id": oid }; // Crea un filtro para encontrar el libro por su ID
    let update = doc! { "$set": bson::to_document(&payload).unwrap() }; // Crea un documento de actualización con los nuevos datos

    col.update_one(filter, update, None).await.unwrap(); // Actualiza el libro en la colección
    Json(json!({"msg": "Libro actualizado"})) // Devuelve un mensaje de éxito como JSON
}

// Controlador para eliminar un libro
pub async fn delete_book(State(client): State<AppState>, Path(id): Path<String>) -> Json<serde_json::Value> {
    let db = client.database("biblioteca"); // Obtiene la base de datos "biblioteca"
    let col = db.collection::<Book>("libros"); // Obtiene la colección "libros"

    let oid = ObjectId::parse_str(id).unwrap(); // Convierte el ID de la ruta en un ObjectId
    col.delete_one(doc! { "_id": oid }, None).await.unwrap(); // Elimina el libro de la colección

    Json(json!({"msg": "Libro eliminado"})) // Devuelve un mensaje de éxito como JSON
}
