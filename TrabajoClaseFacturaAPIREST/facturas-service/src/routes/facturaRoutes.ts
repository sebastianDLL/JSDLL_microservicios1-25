import { Router } from "express";
import { 
  getAllFacturas, 
  getFacturaById, 
  createFactura, 
  updateFactura, 
  deleteFactura 
} from "../controllers/facturaController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleFactura:
 *       type: object
 *       required:
 *         - productoId
 *         - cantidad
 *         - precioUnitario
 *       properties:
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *         cantidad:
 *           type: integer
 *           description: Cantidad del producto
 *         precioUnitario:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 *       example:
 *         productoId: 1
 *         cantidad: 5
 *         precioUnitario: 25.99
 *
 *     Factura:
 *       type: object
 *       required:
 *         - clienteId
 *         - detalles
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la factura
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la factura
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetalleFactura'
 *           description: Lista de detalles de la factura
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la factura (calculado)
 *       example:
 *         id: 1
 *         fecha: "2025-04-10T15:30:25.000Z"
 *         clienteId: 2
 *         detalles:
 *           - productoId: 1
 *             cantidad: 2
 *             precioUnitario: 99.99
 *           - productoId: 3
 *             cantidad: 1
 *             precioUnitario: 149.50
 *         total: 349.48
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
 */

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Obtiene todas las facturas
 *     tags: [Facturas]
 *     responses:
 *       200:
 *         description: Lista de todas las facturas
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
 *         description: Información detallada de la factura
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
 *               - detalles
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *               detalles:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/DetalleFactura'
 *                 description: Lista de detalles de la factura
 *             example:
 *               clienteId: 1
 *               detalles:
 *                 - productoId: 2
 *                   cantidad: 3
 *                   precioUnitario: 49.99
 *                 - productoId: 5
 *                   cantidad: 1
 *                   precioUnitario: 199.50
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       400:
 *         description: Datos inválidos o recursos no existentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: El cliente especificado no existe
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
 *     summary: Actualiza una factura existente (solo se permite actualizar el cliente)
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
 *                 description: ID del cliente
 *             example:
 *               clienteId: 3
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       400:
 *         description: Datos inválidos o intento de actualizar detalles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se permite actualizar los detalles de una factura, cree una nueva factura
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
 *                   example: Error al actualizar la factura
 */
router.put("/:id", updateFactura);

/**
 * @swagger
 * /api/facturas/{id}:
 *   delete:
 *     summary: Elimina una factura y restaura el stock de productos
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
