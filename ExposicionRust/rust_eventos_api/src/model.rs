use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use mongodb::bson::DateTime;

#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    pub id: i32,
    pub nombre: String,
    pub fecha: String,
    pub lugar: String,
    pub capacidad: i32,
    pub precio: String,
    pub created_at: DateTime,  // Cambio de String a DateTime
    pub updated_at: DateTime,  // Cambio de String a DateTime
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Purchase {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub usuario_id: String,
    pub evento_id: i32, // Cambiado a i32
    pub cantidad: i32,
    pub pagado: bool,
    pub fecha_compra: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePurchaseDto {
    pub evento_id: i32, // Cambiado a i32
    pub cantidad: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePurchaseDto {
    pub pagado: Option<bool>,
}