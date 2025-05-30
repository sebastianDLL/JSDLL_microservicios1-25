mod api;
mod error;
mod model;
mod repository;

use actix_cors::Cors;
use actix_web::{
    middleware::Logger, 
    web, 
    App, 
    HttpServer, 
    dev::ServiceRequest, 
    Error, 
    HttpMessage
};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use actix_web_httpauth::middleware::HttpAuthentication;
use api::habitaciones_api::{
    listar_habitaciones, crear_habitacion, actualizar_habitacion, eliminar_habitacion,Claims
};
use dotenv::dotenv;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use mongodb::{options::ClientOptions, Client};
use repository::mongodb_repo::MongoRepo;
use std::env;

// Función de validación JWT para el middleware de autenticación
async fn jwt_validator(req: ServiceRequest, credentials: BearerAuth) -> Result<ServiceRequest, (Error, ServiceRequest)> {
    let token = credentials.token();
    let jwt_secret = env::var("LlaveJWT").expect("LlaveJWT no está establecida en .env");

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;

    match decode::<Claims>(
    token,
    &DecodingKey::from_secret(jwt_secret.as_ref()),
    &validation,
) {
    Ok(token_data) => {
        let claims = token_data.claims;
        req.extensions_mut().insert(claims); // <-- Inserta Claims completo
        Ok(req)
    },
    Err(_) => {
        Err((actix_web::error::ErrorUnauthorized("Token JWT inválido").into(), req))
    }
}
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Validar que las variables de entorno necesarias estén presentes
    let mongo_uri = env::var("MONGO_URI").expect("MONGO_URI no está establecida en .env");
    let mongo_db_name = env::var("MONGO_DB_NAME").expect("MONGO_DB_NAME no está establecida en .env");
    let _jwt_secret = env::var("LlaveJWT").expect("LlaveJWT no está establecida en .env");

    let client_options = ClientOptions::parse(&mongo_uri)
        .await
        .expect("Error al analizar la URI de MongoDB");
    let client = Client::with_options(client_options).expect("Error al crear el cliente de MongoDB");
    let db = client.database(&mongo_db_name);

    let mongo_repo = MongoRepo::new(db);
    let mongo_data = web::Data::new(mongo_repo);

    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8081".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT debe ser un número");

    log::info!("Iniciando servidor en http://{}:{}", server_host, server_port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        // Configuración de autenticación Bearer con JWT
        let auth = HttpAuthentication::bearer(jwt_validator);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(mongo_data.clone())
            .service(
                web::scope("/api")
                    // Endpoints protegidos que requieren autenticación
                    .service(
                        web::scope("")
                            .wrap(auth)
                            .service(listar_habitaciones)
                            .service(crear_habitacion)
                            .service(actualizar_habitacion)
                            .service(eliminar_habitacion)
                    ),
            )
    })
    .bind((server_host, server_port))?
    .run()
    .await
}