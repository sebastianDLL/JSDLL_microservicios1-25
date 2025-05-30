use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use mongodb::bson;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Error de MongoDB: {0}")]
    MongoError(#[from] mongodb::error::Error),

    #[error("Error de BSON: {0}")]
    BsonError(#[from] bson::ser::Error),

    #[error("Error de deserialización BSON: {0}")]
    BsonDeError(#[from] bson::de::Error),

    #[error("ID inválido: {0}")]
    InvalidIDError(String),

    #[error("Recurso no encontrado")]
    NotFoundError,

    #[error("No hay suficientes entradas disponibles")]
    NotEnoughTickets,

    #[error("Compra ya pagada")]
    AlreadyPaid,

    #[error("Error interno del servidor: {0}")]
    InternalError(String),

    #[error("Error de autenticación: {0}")]
    Unauthorized(String),
}

#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    status: String,
    message: String,
}

impl ResponseError for AppError {
    fn error_response(&self) -> HttpResponse {
        let status_code = self.status_code();
        HttpResponse::build(status_code).json(ErrorResponse {
            status: status_code.to_string(),
            message: self.to_string(),
        })
    }

    fn status_code(&self) -> StatusCode {
        match self {
            AppError::NotFoundError => StatusCode::NOT_FOUND,
            AppError::InvalidIDError(_) => StatusCode::BAD_REQUEST,
            AppError::NotEnoughTickets => StatusCode::BAD_REQUEST,
            AppError::AlreadyPaid => StatusCode::BAD_REQUEST,
            AppError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            AppError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}