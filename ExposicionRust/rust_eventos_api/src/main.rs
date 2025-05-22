mod api;
mod error;
mod model;
mod repository;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer, dev::ServiceRequest, Error, HttpMessage};
use actix_web_httpauth::extractors::bearer::{BearerAuth, Config};
use actix_web_httpauth::middleware::HttpAuthentication;
use api::compra_api::{
    get_all_events, create_purchase, get_user_purchases, pay_purchase, delete_purchase,
};
use dotenv::dotenv;
use mongodb::{options::ClientOptions, Client, bson::oid::ObjectId};
use repository::mongodb_repo::MongoRepo;
use std::env;

// Función de validación simple para el middleware de autenticación
async fn validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    // En un sistema real, aquí verificarías el token JWT o similar
    // Para este ejemplo, simplemente extraemos un ID de usuario del token
    // En producción, usarías un sistema de autenticación adecuado

    // Simulamos obtener el ID del usuario a partir del token
    // En un sistema real, decodificarías el JWT
    let token = credentials.token();

    // Por simplicidad, usamos el token como si fuera un ID de MongoDB válido
    // En un sistema real, el token contendría información del usuario
    match ObjectId::parse_str(token) {
        Ok(user_id) => {
            // Añadimos el ID del usuario a los datos de la solicitud
            req.extensions_mut().insert(user_id);
            Ok(req)
        },
        Err(_) => {
            // Token inválido
            Err((actix_web::error::ErrorUnauthorized("Token inválido").into(), req))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI no está establecida en .env");
    let mongo_db_name = env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME no está establecida en .env");

    let client_options = ClientOptions::parse(&mongo_uri)
        .await
        .expect("Error al analizar la URI de MongoDB");
    let client = Client::with_options(client_options).expect("Error al crear el cliente de MongoDB");
    let db = client.database(&mongo_db_name);

    let mongo_repo = MongoRepo::new(db);
    let mongo_data = web::Data::new(mongo_repo);

    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8082".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT debe ser un número");

    log::info!("Iniciando servidor en http://{}:{}", server_host, server_port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        // Configuración de autenticación Bearer
        let auth = HttpAuthentication::bearer(validator);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(mongo_data.clone())
            .service(
                web::scope("/api")
                    .service(get_all_events)
                    .service(
                        web::scope("")
                            .wrap(auth)
                            .service(create_purchase)
                            .service(get_user_purchases)
                            .service(pay_purchase)
                            .service(delete_purchase)
                    ),
            )
    })
    .bind((server_host, server_port))?
    .run()
    .await
}