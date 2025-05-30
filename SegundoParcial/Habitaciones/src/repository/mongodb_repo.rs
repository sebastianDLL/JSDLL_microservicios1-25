use crate::{
    error::AppError,
    model::{Habitacion, CreateHabitacionDto, UpdateHabitacionDto},
};
use futures::stream::TryStreamExt;
use mongodb::{
    bson::{doc, Document},
    Database,
};

const HABITACIONES_COLLECTION: &str = "habitaciones";

#[derive(Clone)]
pub struct MongoRepo {
    db: Database,
}

impl MongoRepo {
    pub fn new(db: Database) -> Self {
        MongoRepo { db }
    }

    // Obtener todas las habitaciones
    pub async fn get_all_habitaciones(&self) -> Result<Vec<Habitacion>, AppError> {
        let collection = self.db.collection::<Habitacion>(HABITACIONES_COLLECTION);
        let mut cursor = collection.find(None, None).await?;
        let mut habitaciones = Vec::new();
        while let Some(habitacion) = cursor.try_next().await? {
            habitaciones.push(habitacion);
        }
        Ok(habitaciones)
    }

    // Obtener una habitacion por id
    pub async fn get_habitacion(&self, id: i32) -> Result<Habitacion, AppError> {
        let collection = self.db.collection::<Habitacion>(HABITACIONES_COLLECTION);
        let filter = doc! {"id": id};
        let habitacion = collection
            .find_one(filter, None)
            .await?
            .ok_or(AppError::NotFoundError)?;
        Ok(habitacion)
    }

    // Crear una habitacion
    pub async fn create_habitacion(&self, dto: CreateHabitacionDto) -> Result<Habitacion, AppError> {
        let collection = self.db.collection::<Habitacion>(HABITACIONES_COLLECTION);

        // Puedes generar el id aquí si lo deseas, o dejar que Mongo lo maneje
        let habitacion = Habitacion {
            id: dto.numero_habitacion, // O usa otro generador de id
            numero_habitacion: dto.numero_habitacion,
            tipo_habitacion: dto.tipo_habitacion,
            precio_noche: dto.precio_noche,
            estado: dto.estado,
            descripcion: dto.descripcion,
        };

        collection.insert_one(&habitacion, None).await?;
        Ok(habitacion)
    }

    // Actualizar una habitacion
    pub async fn update_habitacion(&self, id: i32, dto: UpdateHabitacionDto) -> Result<Habitacion, AppError> {
        let collection = self.db.collection::<Habitacion>(HABITACIONES_COLLECTION);
        let filter = doc! {"id": id};

        let mut update_doc = Document::new();
        update_doc.insert("numero_habitacion", dto.numero_habitacion);
        update_doc.insert("tipo_habitacion", dto.tipo_habitacion);
        update_doc.insert("precio_noche", dto.precio_noche);
        update_doc.insert("estado", dto.estado);
        update_doc.insert("descripcion", dto.descripcion);

        let update = doc! {"$set": update_doc};
        let options = mongodb::options::FindOneAndUpdateOptions::builder()
            .return_document(mongodb::options::ReturnDocument::After)
            .build();

        let updated = collection
            .find_one_and_update(filter, update, options)
            .await?
            .ok_or(AppError::NotFoundError)?;

        Ok(updated)
    }

    // Eliminar una habitacion
    pub async fn delete_habitacion(&self, id: i32) -> Result<(), AppError> {
        let collection = self.db.collection::<Habitacion>(HABITACIONES_COLLECTION);
        let filter = doc! {"id": id};
        let delete_result = collection.delete_one(filter, None).await?;
        if delete_result.deleted_count == 0 {
            return Err(AppError::NotFoundError);
        }
        Ok(())
    }
}
