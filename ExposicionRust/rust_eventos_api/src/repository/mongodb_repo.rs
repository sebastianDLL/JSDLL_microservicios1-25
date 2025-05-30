use crate::{
    error::AppError,
    model::{Event, Purchase, CreatePurchaseDto, UpdatePurchaseDto},
};
use futures::stream::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId, Document},
    Database,
};

const EVENTS_COLLECTION: &str = "events";
const PURCHASES_COLLECTION: &str = "purchases";

#[derive(Clone)]
pub struct MongoRepo {
    db: Database,
}

impl MongoRepo {
    pub fn new(db: Database) -> Self {
        MongoRepo { db }
    }

    // Obtener todos los eventos
    pub async fn get_all_events(&self) -> Result<Vec<Event>, AppError> {
        let collection = self.db.collection::<Event>(EVENTS_COLLECTION);
        let mut cursor = collection.find(None, None).await?;
        let mut events = Vec::new();
        while let Some(event) = cursor.try_next().await? {
            events.push(event);
        }
        Ok(events)
    }

    pub async fn get_event(&self, id: i32) -> Result<Event, AppError> {
        let collection = self.db.collection::<Event>(EVENTS_COLLECTION);
        let filter = doc! {"id": id};
        let event = collection
            .find_one(filter, None)
            .await?
            .ok_or(AppError::NotFoundError)?;
        Ok(event)
    }

    // Obtener todas las compras de un usuario (ahora usuario_id es String)
    pub async fn get_purchases_by_user(&self, usuario_id: String) -> Result<Vec<Purchase>, AppError> {
        let collection = self.db.collection::<Purchase>(PURCHASES_COLLECTION);
        let filter = doc! {"usuario_id": usuario_id};
        let mut cursor = collection.find(filter, None).await?;
        let mut purchases = Vec::new();
        while let Some(purchase) = cursor.try_next().await? {
            purchases.push(purchase);
        }
        Ok(purchases)
    }

    // Crear una compra (ahora usuario_id es String)
    pub async fn create_purchase(&self, usuario_id: String, dto: CreatePurchaseDto) -> Result<Purchase, AppError> {
        // 1. Verificar que el evento existe y tiene suficientes entradas
        let evento_id = dto.evento_id;
        let event = self.get_event(evento_id).await?;
        
        if event.capacidad < dto.cantidad {
            return Err(AppError::NotEnoughTickets);
        }
        
        // 3. Crear la compra
        let collection = self.db.collection::<Purchase>(PURCHASES_COLLECTION);

        let purchase = Purchase {
            id: None,
            usuario_id, // Ahora es String directamente
            evento_id,
            cantidad: dto.cantidad,
            pagado: false,
            fecha_compra: chrono::Utc::now().to_rfc3339(),
        };

        let insert_result = collection.insert_one(purchase, None).await?;
        let id = insert_result
            .inserted_id
            .as_object_id()
            .ok_or(AppError::InternalError("Error al obtener ID de la compra creada".to_string()))?;

        self.get_purchase(id).await
    }

    // Obtener una compra por ID
    pub async fn get_purchase(&self, id: ObjectId) -> Result<Purchase, AppError> {
        let collection = self.db.collection::<Purchase>(PURCHASES_COLLECTION);
        let filter = doc! {"_id": id};
        let purchase = collection
            .find_one(filter, None)
            .await?
            .ok_or(AppError::NotFoundError)?;
        Ok(purchase)
    }

    // Actualizar una compra
    pub async fn update_purchase(&self, id: ObjectId, dto: UpdatePurchaseDto) -> Result<Purchase, AppError> {
        // Verificar que la compra existe
        let purchase = self.get_purchase(id).await?;
        
        // Si la compra ya está pagada y se intenta marcar como pagada de nuevo
        if purchase.pagado && dto.pagado.unwrap_or(false) {
            return Err(AppError::AlreadyPaid);
        }

        let collection = self.db.collection::<Purchase>(PURCHASES_COLLECTION);
        let filter = doc! {"_id": id};

        let mut update_doc = Document::new();
        if let Some(pagado) = dto.pagado {
            update_doc.insert("pagado", pagado);
        }

        if update_doc.is_empty() {
            return self.get_purchase(id).await;
        }

        let update = doc! {"$set": update_doc};
        let options = mongodb::options::FindOneAndUpdateOptions::builder()
            .return_document(mongodb::options::ReturnDocument::After)
            .build();

        let updated_purchase = collection
            .find_one_and_update(filter, update, options)
            .await?
            .ok_or(AppError::NotFoundError)?;

        Ok(updated_purchase)
    }

    // Eliminar una compra
    pub async fn delete_purchase(&self, id: ObjectId) -> Result<(), AppError> {
        // 1. Obtener la compra para saber cuántas entradas devolver
        let purchase = self.get_purchase(id).await?;
        
        // 2. Si la compra ya está pagada, no se puede eliminar
        if purchase.pagado {
            return Err(AppError::AlreadyPaid);
        }

        // 3. Devolver las entradas al evento
        let events_collection = self.db.collection::<Event>(EVENTS_COLLECTION);
        let filter = doc! {"_id": purchase.evento_id};
        let update = doc! {
            "$inc": {
                "capacidad": purchase.cantidad
            }
        };
        events_collection.update_one(filter, update, None).await?;

        // 4. Eliminar la compra
        let collection = self.db.collection::<Purchase>(PURCHASES_COLLECTION);
        let filter = doc! {"_id": id};
        let delete_result = collection.delete_one(filter, None).await?;
        
        if delete_result.deleted_count == 0 {
            return Err(AppError::NotFoundError);
        }
        
        Ok(())
    }
}