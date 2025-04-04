import { DataSource } from "typeorm";

import dotenv from 'dotenv';
import { Cliente } from "./entities/Cliente";
import { Producto } from "./entities/Producto";
import { Factura } from "./entities/Factura";
import { DetalleFactura } from "./entities/DetalleFactura";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ventas",
  synchronize: true,
  logging: false,
  entities: [Cliente, Producto, Factura, DetalleFactura],
});