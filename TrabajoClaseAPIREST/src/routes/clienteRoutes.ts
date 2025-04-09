import { Router } from "express";
import { 
  getAllClientes, 
  getClienteById, 
  createCliente, 
  updateCliente, 
  deleteCliente 
} from "../controllers/clienteController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - ci
 *         - nombres
 *         - apellidos
 *         - sexo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del cliente
 *         ci:
 *           type: string
 *           description: Cédula de Identidad del cliente
 *         nombres:
 *           type: string
 *           description: Nombres del cliente
 *         apellidos:
 *           type: string
 *           description: Apellidos del cliente
 *         sexo:
 *           type: string
 *           description: Sexo del cliente
 *           enum: [M, F]
 *       example:
 *         id: 1
 *         ci: "12345678"
 *         nombres: "Juan Carlos"
 *         apellidos: "Pérez Gómez"
 *         sexo: "M"
 *   responses:
 *     ClienteNotFound:
 *       description: Cliente no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Cliente no encontrado
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de todos los clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener clientes
 */
router.get("/", getAllClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtiene un cliente por su ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Información del cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         $ref: '#/components/responses/ClienteNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener el cliente
 */
router.get("/:id", getClienteById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ci
 *               - nombres
 *               - apellidos
 *               - sexo
 *             properties:
 *               ci:
 *                 type: string
 *                 description: Cédula de Identidad
 *               nombres:
 *                 type: string
 *                 description: Nombres del cliente
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del cliente
 *               sexo:
 *                 type: string
 *                 description: Sexo (M o F)
 *             example:
 *               ci: "87654321"
 *               nombres: "María Elena"
 *               apellidos: "Rodríguez López"
 *               sexo: "F"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos o cliente ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ya existe un cliente con ese CI
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al crear el cliente
 */
router.post("/", createCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualiza un cliente existente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *                 description: Cédula de Identidad
 *               nombres:
 *                 type: string
 *                 description: Nombres del cliente
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del cliente
 *               sexo:
 *                 type: string
 *                 description: Sexo (M o F)
 *             example:
 *               ci: "12345678"
 *               nombres: "Juan Pablo"
 *               apellidos: "Pérez García"
 *               sexo: "M"
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos o conflicto con CI existente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ya existe otro cliente con ese CI
 *       404:
 *         $ref: '#/components/responses/ClienteNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al actualizar el cliente
 */
router.put("/:id", updateCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque tiene facturas asociadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se puede eliminar el cliente porque tiene facturas asociadas
 *       404:
 *         $ref: '#/components/responses/ClienteNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al eliminar el cliente
 */
router.delete("/:id", deleteCliente);

export default router;