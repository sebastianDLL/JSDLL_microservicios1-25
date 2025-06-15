const express = require('express');
const { registerUser, loginUser, getProfile, getMedicos, getPacientes, getAdministradores } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route for getting user profile (protected)
router.get('/profile', authenticate, getProfile);

// Ruta para obtener los Medicos
// Route for getting doctors (protected)
router.get('/doctores', authenticate, getMedicos);
// Ruta para obtener los Pacientes
// Route for getting patients (protected)
router.get('/pacientes', authenticate, getPacientes);
// Ruta para obtener los Administradores
// Route for getting administrators (protected)
router.get('/administradores', authenticate, getAdministradores);

module.exports = router;