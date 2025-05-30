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

    #[error("ID de habitación inválido: {0}")]
    InvalidRoomID(String),

    #[error("Habitación no encontrada")]
    NotFoundError,

    #[error("No hay habitaciones disponibles")]
    NoRoomsAvailable,

    #[error("La habitación ya está ocupada")]
    RoomAlreadyOccupied,

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
            AppError::InvalidRoomID(_) => StatusCode::BAD_REQUEST,
            AppError::NoRoomsAvailable => StatusCode::BAD_REQUEST,
            AppError::RoomAlreadyOccupied => StatusCode::BAD_REQUEST,
            AppError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            AppError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}