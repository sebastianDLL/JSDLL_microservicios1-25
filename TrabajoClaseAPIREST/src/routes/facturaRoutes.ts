import { Router } from "express";
import { createFactura, deleteFactura, getAllFacturas, getFacturaById, getFacturasByCliente, updateFactura } from "../controllers/facturaController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       required:
 *         - clienteId
 *         - fecha
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la factura
 *         clienteId:
 *           type: integer
 *           description: ID del cliente asociado a la factura
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de emisión de la factura
 *         cliente:
 *           $ref: '#/components/schemas/Cliente'
 *       example:
 *         id: 1
 *         clienteId: 1
 *         fecha: "2025-04-09T15:30:00Z"
 *         cliente:
 *           id: 1
 *           ci: "12345678"
 *           nombres: "Juan Carlos"
 *           apellidos: "Pérez Gómez"
 *           sexo: "M"
 *   responses:
 *     FacturaNotFound:
 *       description: Factura no encontrada
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Factura no encontrada
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
 * /api/facturas:
 *   get:
 *     summary: Obtiene todas las facturas
 *     tags: [Facturas]
 *     responses:
 *       200:
 *         description: Lista de todas las facturas con su información de cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener facturas
 */
router.get("/", getAllFacturas);

/**
 * @swagger
 * /api/facturas/{id}:
 *   get:
 *     summary: Obtiene una factura por su ID
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Información de la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         $ref: '#/components/responses/FacturaNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener la factura
 */
router.get("/:id", getFacturaById);

/**
 * @swagger
 * /api/facturas/cliente/{clienteId}:
 *   get:
 *     summary: Obtiene todas las facturas de un cliente específico
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de facturas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
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
 *                   example: Error al obtener las facturas del cliente
 */
router.get("/cliente/:clienteId", getFacturasByCliente);

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Crea una nueva factura
 *     tags: [Facturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente asociado a la factura
 *             example:
 *               clienteId: 1
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
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
 *                   example: Error al crear la factura
 */
router.post("/", createFactura);

/**
 * @swagger
 * /api/facturas/{id}:
 *   put:
 *     summary: Actualiza una factura existente
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del nuevo cliente asociado a la factura
 *             example:
 *               clienteId: 2
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       404:
 *         description: Factura o cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/FacturaNotFound'
 *                 - $ref: '#/components/responses/ClienteNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al actualizar la factura
 */
router.put("/:id", updateFactura);

/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Elimina una factura
 *     tags: [Facturas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Factura eliminada correctamente
 *       404:
 *         $ref: '#/components/responses/FacturaNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al eliminar la factura
 */
router.delete("/:id", deleteFactura);

export default router;