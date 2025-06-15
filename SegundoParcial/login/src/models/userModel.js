const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'db_usuarios',
  password: process.env.DB_PASSWORD || 'lilianjc123',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const createUserTable = async (retries = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to database (attempt ${i + 1}/${retries})...`);
      
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await pool.query(query);
      console.log('✅ Users table created or already exists');
      
      // Insertar usuario de prueba si no existe
      const checkUser = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', ['admin@test.com']);
      if (parseInt(checkUser.rows[0].count) === 0) {
        await pool.query(
          'INSERT INTO users (email, password) VALUES ($1, $2)',
          ['admin@test.com', 'hashedpassword123']
        );
        console.log('✅ Test user created');
      }
      
      return;
    } catch (error) {
      console.error(`❌ Error creating users table (attempt ${i + 1}):`, error.message);
      
      if (i === retries - 1) {
        console.error('🔴 Failed to create table after all retries');
        throw error;
      }
      
      // Esperar antes del siguiente intento
      console.log(`⏳ Waiting 3 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// Test de conexión
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

const User = {
  create: async (email, password) => {
    try {
      const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at';
      const values = [email, password];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const values = [email];
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (error) {
      console.error('Error finding user:', error.message);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const query = 'SELECT id, email, created_at FROM users ORDER BY created_at DESC';
      const res = await pool.query(query);
      return res.rows;
    } catch (error) {
      console.error('Error getting all users:', error.message);
      throw error;
    }
  }
};

// Inicializar cuando se cargue el módulo
const initializeDatabase = async () => {
  console.log('🚀 Initializing database...');
  await testConnection();
  await createUserTable();
};

// Ejecutar inicialización
initializeDatabase().catch(error => {
  console.error('🔴 Database initialization failed:', error.message);
});

module.exports = User;