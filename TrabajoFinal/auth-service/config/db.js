const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function connectWithRetry(retries = 20, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.getConnection();
      console.log("Conectado a la base de datos MySQL");
      return;
    } catch (err) {
      console.error(`Error al conectar a la base de datos (intento ${i + 1}):`, err.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("No se pudo conectar a la base de datos después de varios intentos.");
      }
    }
  }
}

connectWithRetry();

module.exports = pool;
