import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { Factura } from "./entities/Factura";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || 'mysecretpassword',
  database: process.env.DB_DATABASE || 'microservices',
  synchronize: true,
  logging: false,
  entities: [Factura],
});