use actix_web::{
    get, post, put, delete,
    web::{self, Json, Path},
    HttpResponse,
};
use serde::{Deserialize, Serialize};

use crate::{
    error::AppError,
    model::{CreateHabitacionDto, UpdateHabitacionDto},
    repository::mongodb_repo::MongoRepo,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub email: String,
    pub sub: i32,
    pub iat: usize,
    pub exp: usize,
}

// Listar habitaciones (protegido)
#[get("/habitaciones")]
pub async fn listar_habitaciones(
    db: web::Data<MongoRepo>,
    _claims: web::ReqData<Claims>,
) -> Result<HttpResponse, AppError> {
    println!("Entrando a listar_habitaciones");
    let habitaciones = db.get_all_habitaciones().await?;
    println!("Habitaciones obtenidas: {:?}", habitaciones);
    Ok(HttpResponse::Ok().json(habitaciones))
}

// Crear habitacion (protegido)
#[post("/habitaciones")]
pub async fn crear_habitacion(
    db: web::Data<MongoRepo>,
    _claims: web::ReqData<Claims>,
    dto: Json<CreateHabitacionDto>,
) -> Result<HttpResponse, AppError> {
    println!("Entrando a crear_habitacion con dto: {:?}", dto);
    let habitacion = db.create_habitacion(dto.into_inner()).await?;
    println!("Habitacion creada: {:?}", habitacion);
    Ok(HttpResponse::Created().json(habitacion))
}

// Actualizar habitacion (protegido)
#[put("/habitaciones/{id}")]
pub async fn actualizar_habitacion(
    db: web::Data<MongoRepo>,
    _claims: web::ReqData<Claims>,
    id: Path<i32>,
    dto: Json<UpdateHabitacionDto>,
) -> Result<HttpResponse, AppError> {
    println!("Entrando a actualizar_habitacion con id: {:?}, dto: {:?}", id, dto);
    let habitacion = db.update_habitacion(id.into_inner(), dto.into_inner()).await?;
    println!("Habitacion actualizada: {:?}", habitacion);
    Ok(HttpResponse::Ok().json(habitacion))
}

// Eliminar habitacion (protegido)
#[delete("/habitaciones/{id}")]
pub async fn eliminar_habitacion(
    db: web::Data<MongoRepo>,
    _claims: web::ReqData<Claims>,
    id: Path<i32>,
) -> Result<HttpResponse, AppError> {
    println!("Entrando a eliminar_habitacion con id: {:?}", id);
    db.delete_habitacion(id.into_inner()).await?;
    println!("Habitacion eliminada");
    Ok(HttpResponse::NoContent().finish())
}
