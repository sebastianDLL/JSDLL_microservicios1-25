const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/authRoutes");

// Swagger imports
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API de Autenticación",
      version: "1.0.0",
      description: "Documentación de la API de autenticación",
    },
    servers: [
      {
        url: "/api/auth",
        description: "Auth API base path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware CORS (opcional, útil para desarrollo)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "El servicio está en funcionamiento",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("🔴 Error no controlado:", err);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Algo salió mal",
  });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 El servidor está corriendo en el puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📄 Swagger docs: http://localhost:${PORT}/api-docs`);
});
