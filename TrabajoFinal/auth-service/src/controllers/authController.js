const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { get } = require("../routes/authRoutes");

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Error interno del servidor
 */
const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Correo electrónico, contraseña y rol son requeridos",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser({
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id || newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
    });
  }
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Datos faltantes o inválidos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Correo electrónico y contraseña son requeridos",
    });
  }

  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
    });
  }
};

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el perfil",
    });
  }
};

const getMedicos = async (req, res) => {
  try {
    const medicos = await User.getMedicos();
    res.json({
      success: true,
      medicos,
    });
  } catch (error) {
    console.error("Error al obtener los médicos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los médicos",
    });
  }
};
const getPacientes = async (req, res) => {
  try {
    const pacientes = await User.getPacientes();
    res.json({
      success: true,
      pacientes,
    });
  } catch (error) {
    console.error("Error al obtener los pacientes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los pacientes",
    });
  }
};
const getAdministradores = async (req, res) => {
  try {
    const administradores = await User.getAdministradores();
    res.json({
      success: true,
      administradores,
    });
  } catch (error) {
    console.error("Error al obtener los administradores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los administradores",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getMedicos,
  getPacientes,
  getAdministradores
};
