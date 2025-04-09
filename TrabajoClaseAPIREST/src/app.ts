import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/clienteRoutes";
import productoRoutes from "./routes/productoRoutes";
import facturaRoutes from "./routes/facturaRoutes";
import detalleFacturaRoutes from "./routes/detalleFacturaRoutes";
import path from "path";

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/clientes", clienteRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/detalles", detalleFacturaRoutes);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Sistema de Ventas",
      version: "1.0.0",
      description: "Documentación de la API de Ventas con Node.js y TypeORM",
    },
    servers: [{ url: "http://localhost:3000", description: "Servidor Local" }],
  },
  apis: [path.join(__dirname, "routes/*.ts")] // Cambiado a .ts para que detecte los archivos TypeScript
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Base route
app.get("/", (req, res) => {
  res.send("API de Sistema de Ventas funcionando!");
});

export default app;