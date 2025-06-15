use actix_web::{
    delete, get, post, put,
    web::{self, Json, Path},
    HttpRequest, HttpResponse,
};
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use serde_json::json;
use actix_web::HttpMessage;
use std::env;

use crate::{
    error::AppError,
    model::{CreatePurchaseDto, UpdatePurchaseDto},
    repository::mongodb_repo::MongoRepo,
};

// Estructura para los claims del JWT actualizada
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub name: String,
    pub email: String,
    pub rol: String,
    pub sub: String,  // ID del usuario como string
    pub iat: usize,   // issued at
    pub exp: usize,   // expiration time
}

// Endpoint para obtener todos los eventos disponibles (público)
#[get("/eventos")]
pub async fn get_all_events(db: web::Data<MongoRepo>) -> Result<HttpResponse, AppError> {
    let events = db.get_all_events().await?;
    Ok(HttpResponse::Ok().json(events))
}

// Endpoint para crear una compra de entradas (protegido)
#[post("/compras")]
pub async fn create_purchase(
    db: web::Data<MongoRepo>,
    usuario_id: web::ReqData<String>,
    purchase_dto: Json<CreatePurchaseDto>,
) -> Result<HttpResponse, AppError> {
    let dto = purchase_dto.into_inner();
    let usuario_id = usuario_id.into_inner();
    let created_purchase = db.create_purchase(usuario_id, dto).await?;
    Ok(HttpResponse::Created().json(created_purchase))
}

// Endpoint para consultar las compras de un usuario (protegido)
#[get("/compras")]
pub async fn get_user_purchases(
    db: web::Data<MongoRepo>,
    usuario_id: web::ReqData<String>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    // Imprimir el token recibido (Authorization header)
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(token) = auth_header.to_str() {
            println!("Token recibido: {}", token);
        }
    }

    let usuario_id = usuario_id.into_inner();
    let purchases = db.get_purchases_by_user(usuario_id).await?;
    Ok(HttpResponse::Ok().json(purchases))
}

// Endpoint para marcar una compra como pagada (protegido)
#[put("/compras/{id}/pagar")]
pub async fn pay_purchase(
    db: web::Data<MongoRepo>,
    purchase_id: Path<String>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    // 1. Obtener el ID y validar
    let id = ObjectId::parse_str(purchase_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;

    // 2. Extraer Claims del token JWT
    let extensions = req.extensions();
    let claims = extensions.get::<Claims>().ok_or_else(|| {
        AppError::Unauthorized("No se pudieron extraer los claims del token".to_string())
    })?;
    let usuario_id = &claims.sub;
    let correo = &claims.email;
    let nombre = &claims.name;

    // 3. Verificar que la compra pertenece al usuario autenticado
    let purchase = db.get_purchase(id).await?;
    if purchase.usuario_id != *usuario_id {
        return Err(AppError::Unauthorized("No tienes permisos para pagar esta compra".to_string()));
    }

    // 4. Marcar la compra como pagada
    let updated_purchase = db.update_purchase(id, UpdatePurchaseDto { pagado: Some(true) }).await?;

    // 5. Enviar mensaje a RabbitMQ
    if let Err(e) = send_notification_to_rabbitmq(&updated_purchase, usuario_id, correo, nombre).await {
        log::error!("Error al enviar notificación a RabbitMQ: {:?}", e);
    }

    Ok(HttpResponse::Ok().json(updated_purchase))
}

// Función auxiliar para enviar notificación a RabbitMQ
// Función auxiliar para enviar notificación a RabbitMQ
async fn send_notification_to_rabbitmq(
    purchase: &crate::model::Purchase,
    usuario_id: &str,
    correo: &str,
    nombre: &str,
) -> Result<(), AppError> {
    use lapin::{
        options::{BasicPublishOptions, QueueDeclareOptions}, 
        types::FieldTable, 
        BasicProperties, 
        Connection, 
        ConnectionProperties
    };

    // Obtener configuración de RabbitMQ desde variables de entorno
    // Usar localhost como fallback para desarrollo local
    let rabbitmq_host = env::var("RABBITMQ_HOST")
        .unwrap_or_else(|_| "localhost".to_string());  // Cambiar fallback
    let rabbitmq_port = env::var("RABBITMQ_PORT")
        .unwrap_or_else(|_| "5672".to_string());
    let rabbitmq_user = env::var("RABBITMQ_USER")
        .unwrap_or_else(|_| "guest".to_string());
    let rabbitmq_pass = env::var("RABBITMQ_PASS")
        .unwrap_or_else(|_| "guest".to_string());
    let queue_name = env::var("RABBITMQ_QUEUE")
        .unwrap_or_else(|_| "notifications_queue".to_string());
    
    let rabbitmq_url = format!(
        "amqp://{}:{}@{}:{}/%2f",
        rabbitmq_user, rabbitmq_pass, rabbitmq_host, rabbitmq_port
    );

    log::info!("Intentando conectar a RabbitMQ en: {}:{}", rabbitmq_host, rabbitmq_port);
    log::info!("URL de conexión: {}", rabbitmq_url);

    let connection = Connection::connect(&rabbitmq_url, ConnectionProperties::default())
        .await
        .map_err(|e| {
            log::error!("Error al conectar con RabbitMQ en {}:{}: {:?}", rabbitmq_host, rabbitmq_port, e);
            log::error!("Posibles causas:");
            log::error!("1. RabbitMQ no está ejecutándose");
            log::error!("2. Puerto {} no está disponible", rabbitmq_port);
            log::error!("3. Firewall bloqueando la conexión");
            AppError::InternalError("Error al conectar con RabbitMQ".into())
        })?;

    let channel = connection.create_channel().await.map_err(|e| {
        log::error!("Error al crear el canal RabbitMQ: {:?}", e);
        AppError::InternalError("Error al crear el canal RabbitMQ".into())
    })?;

    // Configurar la cola como durable
    let queue_options = QueueDeclareOptions {
        durable: true,
        ..Default::default()
    };

    channel
        .queue_declare(
            &queue_name,
            queue_options,
            FieldTable::default(),
        )
        .await
        .map_err(|e| {
            log::error!("Error al declarar la cola '{}': {:?}", queue_name, e);
            AppError::InternalError("Error al declarar la cola".into())
        })?;

    // Preparar el payload para la notificación
    let compra_id = purchase.id
        .map(|id| id.to_hex())
        .unwrap_or_else(|| "unknown".to_string());

    let payload = json!({
        "tipo": "pago_confirmado",
        "usuario_id": usuario_id,
        "nombre": nombre,
        "correo": correo,
        "compra_id": compra_id,
        "cantidad": purchase.cantidad,
        "evento_id": purchase.evento_id,
        "fecha_pago": chrono::Utc::now().to_rfc3339(),
    })
    .to_string();

    channel
        .basic_publish(
            "",
            &queue_name,
            BasicPublishOptions::default(),
            payload.as_bytes(),
            BasicProperties::default(),
        )
        .await
        .map_err(|e| {
            log::error!("Error al publicar en RabbitMQ: {:?}", e);
            AppError::InternalError("Error al publicar en RabbitMQ".into())
        })?
        .await
        .map_err(|e| {
            log::error!("Publicación no confirmada: {:?}", e);
            AppError::InternalError("Publicación no confirmada".into())
        })?;

    log::info!("Notificación enviada exitosamente a RabbitMQ para compra: {}", compra_id);
    Ok(())
}

// Endpoint para eliminar una compra (protegido)
#[delete("/compras/{id}")]
pub async fn delete_purchase(
    db: web::Data<MongoRepo>,
    purchase_id: Path<String>,
    req: HttpRequest,
) -> Result<HttpResponse, AppError> {
    let id = ObjectId::parse_str(purchase_id.into_inner())
        .map_err(|_| AppError::InvalidIDError("ID inválido".to_string()))?;

    // Verificar que la compra pertenece al usuario autenticado
    let extensions = req.extensions();
    let claims = extensions.get::<Claims>().ok_or_else(|| {
        AppError::Unauthorized("No se pudieron extraer los claims del token".to_string())
    })?;
    
    let usuario_id = &claims.sub;
    
    let purchase = db.get_purchase(id).await?;
    if purchase.usuario_id != *usuario_id {
        return Err(AppError::Unauthorized("No tienes permisos para eliminar esta compra".to_string()));
    }

    db.delete_purchase(id).await?;
    Ok(HttpResponse::NoContent().finish())
}