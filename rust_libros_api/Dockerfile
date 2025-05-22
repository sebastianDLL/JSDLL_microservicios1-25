# Usamos una imagen base liviana con Rust (versión más reciente)
FROM rust:slim-bookworm as builder

# Creamos un usuario no root para mayor seguridad
RUN useradd -m appuser

# Creamos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de configuración del proyecto
COPY Cargo.toml ./

# Creamos un proyecto temporal para precargar las dependencias
RUN mkdir -p src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src target

# Copiamos el código fuente real
COPY . .

# Compilamos la aplicación en modo release
RUN cargo build --release

# Creamos una imagen final más pequeña
FROM debian:bookworm-slim

# Instalamos las dependencias mínimas necesarias
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el ejecutable compilado desde la etapa de construcción
COPY --from=builder /app/target/release/rust-mongodb-crud /usr/local/bin/rust-mongodb-crud

# Copiamos el archivo .env
COPY .env /.env

# Exponemos el puerto que usa la aplicación
EXPOSE 8080

# Comandos por defecto para ejecutar la aplicación
CMD ["rust-mongodb-crud"]