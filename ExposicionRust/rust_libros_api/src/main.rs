mod api; // Módulo que contiene la lógica de la API (endpoints).
mod error; // Módulo para manejar errores personalizados.
mod model; // Módulo que define los modelos de datos.
mod repository; // Módulo que maneja la interacción con la base de datos.

use actix_cors::Cors; // Middleware para manejar CORS (Cross-Origin Resource Sharing).
use actix_web::{middleware::Logger, web, App, HttpServer}; // Librerías principales de Actix Web.
use api::book_api::{create_book, delete_book, get_all_books, update_book}; // Endpoints de la API.
use dotenv::dotenv; // Carga variables de entorno desde un archivo .env.
use mongodb::{options::ClientOptions, Client}; // Cliente de MongoDB y opciones de configuración.
use repository::mongodb_repo::MongoRepo; // Repositorio para interactuar con MongoDB.
use std::env; // Manejo de variables de entorno.

#[actix_web::main] // Macro que define el punto de entrada asíncrono para Actix Web.
async fn main() -> std::io::Result<()> {
    dotenv().ok(); // Carga las variables de entorno desde el archivo .env.
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info")); // Inicializa el logger con un nivel de registro predeterminado.

    // Obtiene la URI de MongoDB y el nombre de la base de datos desde las variables de entorno.
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI no está establecida en .env");
    let mongo_db_name = env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME no está establecida en .env");

    // Configura las opciones del cliente de MongoDB.
    let client_options = ClientOptions::parse(&mongo_uri)
        .await
        .expect("Error al analizar la URI de MongoDB");
    let client = Client::with_options(client_options).expect("Error al crear el cliente de MongoDB");
    let db = client.database(&mongo_db_name); // Obtiene la base de datos especificada.
    
    let mongo_repo = MongoRepo::new(db); // Crea una instancia del repositorio de MongoDB.
    let mongo_data = web::Data::new(mongo_repo); // Envuelve el repositorio en un contenedor seguro para compartir datos.

    // Obtiene la dirección y el puerto del servidor desde las variables de entorno o usa valores predeterminados.
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT debe ser un número");

    log::info!("Iniciando servidor en http://{}:{}", server_host, server_port); // Registra un mensaje indicando que el servidor está iniciando.

    // Configura y ejecuta el servidor HTTP.
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin() // Permite solicitudes desde cualquier origen.
            .allow_any_method() // Permite cualquier método HTTP (GET, POST, etc.).
            .allow_any_header(); // Permite cualquier encabezado HTTP.

        App::new()
            .wrap(cors) // Aplica el middleware de CORS.
            .wrap(Logger::default()) // Aplica el middleware de registro de solicitudes.
            .app_data(mongo_data.clone()) // Comparte el repositorio de MongoDB con las rutas.
            .service(
                web::scope("/api") // Define un prefijo para las rutas de la API.
                    .service(get_all_books) // Endpoint para obtener todos los libros.
                    .service(create_book) // Endpoint para crear un libro.
                    .service(update_book) // Endpoint para actualizar un libro.
                    .service(delete_book), // Endpoint para eliminar un libro.
            )
    })
    .bind((server_host, server_port))? // Asocia el servidor a la dirección y puerto especificados.
    .run() // Ejecuta el servidor.
    .await // Espera a que el servidor termine de ejecutarse.
}