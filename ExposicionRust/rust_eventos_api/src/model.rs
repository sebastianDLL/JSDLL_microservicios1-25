use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub nombre: String,
    pub descripcion: String,
    pub fecha: String,
    pub lugar: String,
    pub precio: f64,
    pub entradas_disponibles: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Purchase {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub usuario_id: ObjectId,
    pub evento_id: ObjectId,
    pub cantidad: i32,
    pub pagado: bool,
    pub fecha_compra: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreatePurchaseDto {
    pub evento_id: ObjectId,
    pub cantidad: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdatePurchaseDto {
    pub pagado: Option<bool>,
}