# Auth Service

Este proyecto es un servicio de autenticación construido con Node.js y Express, que utiliza JSON Web Tokens (JWT) para la autenticación de usuarios. El servicio se conecta a una base de datos PostgreSQL y permite el registro y la autenticación de usuarios.

## Estructura del Proyecto

```
auth-service
├── src
│   ├── controllers
│   │   └── authController.js      # Controlador para manejar la autenticación de usuarios
│   ├── models
│   │   └── userModel.js            # Modelo de usuario con campos id, email y password
│   ├── routes
│   │   └── authRoutes.js           # Rutas para registro y autenticación de usuarios
│   ├── middleware
│   │   └── authenticate.js          # Middleware para verificar el token JWT
│   └── app.js                       # Punto de entrada de la aplicación
├── config
│   └── db.js                        # Configuración de la conexión a la base de datos PostgreSQL
├── .env                              # Variables de entorno (credenciales de la base de datos, clave secreta)
├── Dockerfile                        # Definición de la imagen de Docker para la aplicación
├── docker-compose.yml               # Configuración de servicios de Docker
├── package.json                     # Configuración del proyecto para npm
└── README.md                        # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   cd auth-service
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno en el archivo `.env`:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=tu_base_de_datos
   JWT_SECRET=tu_clave_secreta
   ```

## Uso

1. Para ejecutar la aplicación localmente, utiliza el siguiente comando:
   ```
   npm start
   ```

2. Para ejecutar la aplicación utilizando Docker, utiliza:
   ```
   docker-compose up
   ```

## Endpoints

- **POST /api/auth/register**: Registra un nuevo usuario.
- **POST /api/auth/login**: Inicia sesión y devuelve un token JWT.

## Notas

- Asegúrate de tener PostgreSQL instalado y en funcionamiento.
- Este servicio utiliza bcrypt para el hashing de contraseñas y jsonwebtoken para la generación de tokens JWT.