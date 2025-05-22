use crate::{error::AppError, model::{Book, CreateBookDto, UpdateBookDto}};
use futures::stream::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId, Document},
    Database,
};

// Nombre de la colección en MongoDB
const COLLECTION_NAME: &str = "books";

// Estructura que representa el repositorio de MongoDB
#[derive(Clone)]
pub struct MongoRepo {
    db: Database, // Base de datos de MongoDB
}

impl MongoRepo {
    // Constructor para inicializar el repositorio con una base de datos
    pub fn new(db: Database) -> Self {
        MongoRepo { db }
    }

    // Método para obtener todos los libros de la colección
    pub async fn get_all_books(&self) -> Result<Vec<Book>, AppError> {
        let collection = self.db.collection::<Book>(COLLECTION_NAME);
        let mut cursor = collection.find(None, None).await?;
        
        let mut books = Vec::new();
        while let Some(book) = cursor.try_next().await? {
            books.push(book); // Agrega cada libro encontrado al vector
        }
        
        Ok(books) // Devuelve la lista de libros
    }

    // Método para crear un nuevo libro en la colección
    pub async fn create_book(&self, book_dto: CreateBookDto) -> Result<Book, AppError> {
        let collection = self.db.collection::<Book>(COLLECTION_NAME);

        // Crea un nuevo libro a partir del DTO recibido
        let book = Book {
            id: None, // El ID será generado automáticamente por MongoDB
            titulo: book_dto.titulo,
            autor: book_dto.autor,
            editorial: book_dto.editorial,
            anio: book_dto.anio,
            descripcion: book_dto.descripcion,
            numero_pagina: book_dto.numero_pagina,
        };

        // Inserta el libro en la colección
        let insert_result = collection.insert_one(book, None).await?;
        let id = match insert_result.inserted_id.as_object_id() {
            Some(object_id) => object_id, // Obtiene el ID generado
            None => return Err(AppError::InternalError), // Error si no se genera un ID
        };

        self.get_book(id).await // Devuelve el libro recién creado
    }

    // Método para obtener un libro por su ID
    pub async fn get_book(&self, id: ObjectId) -> Result<Book, AppError> {
        let collection = self.db.collection::<Book>(COLLECTION_NAME);
        
        let filter = doc! {"_id": id}; // Filtro para buscar por ID
        let book = collection
            .find_one(filter, None)
            .await?
            .ok_or(AppError::NotFoundError)?; // Error si no se encuentra el libro
        
        Ok(book) // Devuelve el libro encontrado
    }

    // Método para actualizar un libro por su ID
    pub async fn update_book(&self, id: ObjectId, book_dto: UpdateBookDto) -> Result<Book, AppError> {
        let collection = self.db.collection::<Book>(COLLECTION_NAME);
        
        let filter = doc! {"_id": id}; // Filtro para buscar por ID
        
        let mut update_doc = Document::new(); // Documento para almacenar los campos a actualizar
        
        // Agrega los campos a actualizar si están presentes en el DTO
        if let Some(titulo) = book_dto.titulo {
            update_doc.insert("titulo", titulo);
        }
        
        if let Some(autor) = book_dto.autor {
            update_doc.insert("autor", autor);
        }
        
        if let Some(editorial) = book_dto.editorial {
            update_doc.insert("editorial", editorial);
        }
        
        if let Some(anio) = book_dto.anio {
            update_doc.insert("anio", anio);
        }
        
        if let Some(descripcion) = book_dto.descripcion {
            update_doc.insert("descripcion", descripcion);
        }
        
        if let Some(numero_pagina) = book_dto.numero_pagina {
            update_doc.insert("numero_pagina", numero_pagina);
        }
        
        // Si no hay nada que actualizar, regresamos el libro sin modificar
        if update_doc.is_empty() {
            return self.get_book(id).await;
        }
        
        let update = doc! {"$set": update_doc}; // Documento de actualización
        
        let options = mongodb::options::FindOneAndUpdateOptions::builder()
            .return_document(mongodb::options::ReturnDocument::After) // Devuelve el documento actualizado
            .build();
        
        let updated_book = collection
            .find_one_and_update(filter, update, options)
            .await?
            .ok_or(AppError::NotFoundError)?; // Error si no se encuentra el libro
        
        Ok(updated_book) // Devuelve el libro actualizado
    }

    // Método para eliminar un libro por su ID
    pub async fn delete_book(&self, id: ObjectId) -> Result<(), AppError> {
        let collection = self.db.collection::<Book>(COLLECTION_NAME);
        
        let filter = doc! {"_id": id}; // Filtro para buscar por ID
        let delete_result = collection.delete_one(filter, None).await?;
        
        if delete_result.deleted_count == 0 {
            return Err(AppError::NotFoundError); // Error si no se elimina ningún libro
        }
        
        Ok(()) // Devuelve éxito si se elimina el libro
    }
}