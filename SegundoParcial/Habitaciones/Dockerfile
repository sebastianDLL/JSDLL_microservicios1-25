# Etapa 1: Construcción
FROM rustlang/rust:nightly-alpine AS builder

# Instalar dependencias necesarias para compilar
RUN apk add --no-cache musl-dev pkgconfig openssl-dev

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Cargo primero (para aprovechar el cache de Docker)
COPY Cargo.toml Cargo.lock ./

# Crear estructura de directorios y archivos dummy para compilar dependencias
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copiar el código fuente
COPY src/ ./src/
COPY .env ./.env

# Compilar la aplicación
RUN touch src/main.rs && cargo build --release

# Etapa 2: Imagen final
FROM alpine:latest

# Instalar dependencias runtime necesarias
RUN apk add --no-cache ca-certificates libgcc

# Crear usuario no-root para mayor seguridad
RUN addgroup -g 1000 appgroup && \
    adduser -D -s /bin/sh -u 1000 -G appgroup appuser

# Crear directorio de trabajo
WORKDIR /app

# Copiar el binario compilado desde la etapa de construcción
COPY --from=builder /app/target/release/rust-mongodb-crud ./rust-mongodb-crud
COPY --from=builder /app/.env ./.env

# Cambiar propietario de los archivos
RUN chown -R appuser:appgroup /app

# Cambiar al usuario no-root
USER appuser

# Exponer el puerto (ajusta según tu configuración)
EXPOSE 8081

# Comando para ejecutar la aplicación
ENTRYPOINT ["./rust-mongodb-crud"]