use actix_web::{http::StatusCode, HttpResponse, ResponseError}; // Importa tipos y traits necesarios para manejar respuestas HTTP y errores en Actix Web.
use mongodb::bson; // Importa el módulo BSON de MongoDB.
use serde::{Deserialize, Serialize}; // Importa traits para serialización y deserialización.
use thiserror::Error; // Importa el macro `Error` para definir errores personalizados.

#[derive(Error, Debug)] // Deriva las implementaciones de `Error` y `Debug` para la enumeración.
pub enum AppError {
    #[error("Error de MongoDB: {0}")] // Define un error relacionado con MongoDB, usando la fuente `mongodb::error::Error`.
    MongoError(#[from] mongodb::error::Error),
    
    #[error("Error de BSON: {0}")] // Define un error relacionado con la serialización BSON.
    BsonError(#[from] bson::ser::Error),
    
    #[error("Error de deserialización BSON: {0}")] // Define un error relacionado con la deserialización BSON.
    BsonDeError(#[from] bson::de::Error),
    
    #[error("Error de ID inválido: {0}")] // Define un error para IDs inválidos, con un mensaje personalizado.
    InvalidIDError(String),
    
    #[error("Recurso no encontrado")] // Define un error para recursos no encontrados.
    NotFoundError,
    
    #[error("Error interno del servidor")] // Define un error genérico para fallos internos del servidor.
    InternalError,
}

#[derive(Serialize, Deserialize)] // Permite serializar y deserializar la estructura `ErrorResponse`.
struct ErrorResponse {
    status: String, // Código de estado HTTP como cadena.
    message: String, // Mensaje de error detallado.
}

impl ResponseError for AppError {
    // Implementa el trait `ResponseError` para convertir `AppError` en respuestas HTTP.
    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code(); // Obtiene el código de estado HTTP correspondiente al error.
        
        HttpResponse::build(status_code).json(ErrorResponse {
            status: status_code.to_string(), // Convierte el código de estado a cadena.
            message: self.to_string(), // Convierte el error en un mensaje legible.
        })
    }

    fn status_code(&self) -> StatusCode {
        // Asocia códigos de estado HTTP con los diferentes tipos de errores.
        match self {
            AppError::NotFoundError => StatusCode::NOT_FOUND, // 404 para recursos no encontrados.
            AppError::InvalidIDError(_) => StatusCode::BAD_REQUEST, // 400 para IDs inválidos.
            _ => StatusCode::INTERNAL_SERVER_ERROR, // 500 para otros errores.
        }
    }
}