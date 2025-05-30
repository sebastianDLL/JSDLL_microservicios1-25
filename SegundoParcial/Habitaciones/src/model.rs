use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Habitacion {
    pub id: i32,
    pub numero_habitacion: i32,
    pub tipo_habitacion: String,
    pub precio_noche: String,
    pub estado:String,
    pub descripcion: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateHabitacionDto {
    pub numero_habitacion: i32,
    pub tipo_habitacion: String,
    pub precio_noche: String,
    pub estado:String,
    pub descripcion: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateHabitacionDto {
    pub numero_habitacion: i32,
    pub tipo_habitacion: String,
    pub precio_noche: String,
    pub estado:String,
    pub descripcion: String,
}