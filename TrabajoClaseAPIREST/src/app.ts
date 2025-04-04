import express from "express";
import cors from "cors";
import clienteRoutes from "./routes/clienteRoutes";
import productoRoutes from "./routes/productoRoutes";
import facturaRoutes from "./routes/facturaRoutes";
import detalleFacturaRoutes from "./routes/detalleFacturaRoutes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/clientes", clienteRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/detalles", detalleFacturaRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("API de Sistema de Ventas funcionando!");
});

export default app;