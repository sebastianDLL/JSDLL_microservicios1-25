const db = require("../../config/db");

const createUser = async (userData) => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [result] = await connection.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [userData.email, userData.password, userData.role]
    );
    // Fetch the created user by id and return the full user object
    const [rows] = await connection.execute(
      "SELECT id, email, role FROM users WHERE id = ?",
      [result.insertId]
    );
    return rows[0];
  } finally {
    if (connection.release) connection.release();
  }
};

const findUserByEmail = async (email) => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  } finally {
    if (connection.release) connection.release();
  }
};

const getUserById = async (id) => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  } finally {
    if (connection.release) connection.release();
  }
};

const getMedicos = async () => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [rows] = await connection.execute(
      "SELECT id, email FROM users WHERE role = 'Medico'"
    );
    return rows;
  } finally {
    if (connection.release) connection.release();
  }
};

const getPacientes = async () => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [rows] = await connection.execute(
      "SELECT id, email FROM users WHERE role = 'Paciente'"
    );
    return rows;
  } finally {
    if (connection.release) connection.release();
  }
};

const getAdministradores = async () => {
  const connection = db.getConnection ? await db.getConnection() : db;
  try {
    const [rows] = await connection.execute(
      "SELECT id, email FROM users WHERE role = 'admin'"
    );
    return rows;
  } finally {
    if (connection.release) connection.release();
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  getMedicos,
  getPacientes,
  getAdministradores,
};
