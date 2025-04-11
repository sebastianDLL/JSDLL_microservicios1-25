import express from "express";
import cors from "cors";
import productoRoutes from "./routes/productoRoutes";
import path from "path";

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/productos", productoRoutes);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Productos",
      version: "1.0.0",
      description: "Microservicio de Productos para Sistema de Ventas",
    },
    servers: [{ url: "http://localhost:3001", description: "Servidor de Productos" }],
  },
  apis: [path.join(__dirname, "routes/*.ts")]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Base route
app.get("/", (req, res) => {
  res.send("Microservicio de Productos funcionando!");
});

export default app;