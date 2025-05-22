use actix_web::{
    delete, get, post, put,
    web::{self, Json, Path},
    HttpResponse,
};
use mongodb::bson::oid::ObjectId;

use crate::{
    error::AppError,
    model::{CreatePurchaseDto, UpdatePurchaseDto, Event, Purchase},
    repository::mongodb_repo::MongoRepo,
};

// Endpoint para obtener todos los eventos disponibles
#[get("/eventos")]
pub async fn get_all_events(db: web::Data<MongoRepo>) -> Result<HttpResponse, AppError> {
    let events = db.get_all_events().await?;
    Ok(HttpResponse::Ok().json(events))
}

// Endpoint para crear una compra de entradas
#[post("/compras")]
pub async fn create_purchase(
    db: web::Data<MongoRepo>,
    usuario_id: web::ReqData<ObjectId>, // Suponiendo que el usuario autenticado se obtiene del middleware
    purchase_dto: Json<CreatePurchaseDto>,
) -> Result<HttpResponse, AppError> {
    let dto = purchase_dto.into_inner();
    let usuario_id = usuario_id.into_inner();
    let created_purchase = db.create_purchase(usuario_id, dto).await?;
    Ok(HttpResponse::Created().json(created_purchase))
}

// Endpoint para consultar las compras de un usuario
#[get("/compras")]
pub async fn get_user_purchases(
    db: web::Data<MongoRepo>,
    usuario_id: web::ReqData<ObjectId>,
) -> Result<HttpResponse, AppError> {
    let usuario_id = usuario_id.into_inner();
    let purchases = db.get_purchases_by_user(usuario_id).await?;
    Ok(HttpResponse::Ok().json(purchases))
}

// Endpoint para marcar una compra como pagada (simulación de pago)
#[put("/compras/{id}/pagar")]
pub async fn pay_purchase(
    db: web::Data<MongoRepo>,
    purchase_id: Path<String>,
) -> Result<HttpResponse, AppError> {
    let id = ObjectId::parse_str(purchase_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;

    let updated_purchase = db.update_purchase(id, UpdatePurchaseDto { pagado: Some(true) }).await?;
    Ok(HttpResponse::Ok().json(updated_purchase))
}

// Endpoint para eliminar una compra
#[delete("/compras/{id}")]
pub async fn delete_purchase(
    db: web::Data<MongoRepo>,
    purchase_id: Path<String>,
) -> Result<HttpResponse, AppError> {
    let id = ObjectId::parse_str(purchase_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;

    db.delete_purchase(id).await?;
    Ok(HttpResponse::NoContent().finish())
}