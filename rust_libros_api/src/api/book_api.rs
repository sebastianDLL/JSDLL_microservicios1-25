use actix_web::{
    delete, get, post, put,
    web::{self, Json, Path},
    HttpResponse,
};
use mongodb::bson::oid::ObjectId;

use crate::{
    error::AppError,
    model::{CreateBookDto, UpdateBookDto},
    repository::mongodb_repo::MongoRepo,
};

// Endpoint para obtener todos los libros
#[get("/libro")]
pub async fn get_all_books(db: web::Data<MongoRepo>) -> Result<HttpResponse, AppError> {
    // Llama al repositorio para obtener todos los libros
    let books = db.get_all_books().await?;
    // Devuelve los libros en formato JSON con un código de estado 200 (OK)
    Ok(HttpResponse::Ok().json(books))
}

// Endpoint para crear un nuevo libro
#[post("/libro")]
pub async fn create_book(
    db: web::Data<MongoRepo>,
    book_dto: Json<CreateBookDto>, // Datos del libro en formato JSON
) -> Result<HttpResponse, AppError> {
    // Llama al repositorio para crear un nuevo libro con los datos proporcionados
    let created_book = db.create_book(book_dto.into_inner()).await?;
    // Devuelve el libro creado en formato JSON con un código de estado 201 (Created)
    Ok(HttpResponse::Created().json(created_book))
}

// Endpoint para actualizar un libro existente
#[put("/libro/{id}")]
pub async fn update_book(
    db: web::Data<MongoRepo>,
    book_id: Path<String>, // ID del libro proporcionado en la URL
    book_dto: Json<UpdateBookDto>, // Datos actualizados del libro en formato JSON
) -> Result<HttpResponse, AppError> {
    // Convierte el ID proporcionado en un ObjectId de MongoDB
    let id = ObjectId::parse_str(book_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;
    
    // Llama al repositorio para actualizar el libro con el ID y los datos proporcionados
    let updated_book = db.update_book(id, book_dto.into_inner()).await?;
    // Devuelve el libro actualizado en formato JSON con un código de estado 200 (OK)
    Ok(HttpResponse::Ok().json(updated_book))
}

// Endpoint para eliminar un libro existente
#[delete("/libro/{id}")]
pub async fn delete_book(
    db: web::Data<MongoRepo>,
    book_id: Path<String>, // ID del libro proporcionado en la URL
) -> Result<HttpResponse, AppError> {
    // Convierte el ID proporcionado en un ObjectId de MongoDB
    let id = ObjectId::parse_str(book_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;
    
    // Llama al repositorio para eliminar el libro con el ID proporcionado
    db.delete_book(id).await?;
    // Devuelve una respuesta vacía con un código de estado 204 (No Content)
    Ok(HttpResponse::NoContent().finish())
}