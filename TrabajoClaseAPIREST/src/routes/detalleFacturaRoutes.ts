import { Router } from "express";
import { 
  getDetallesByFactura, 
  createDetalle, 
  updateDetalle, 
  deleteDetalle 
} from "../controllers/detalleFacturaController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleFactura:
 *       type: object
 *       required:
 *         - facturaId
 *         - productoId
 *         - cantidad
 *         - precioUnitario
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del detalle de factura
 *         facturaId:
 *           type: integer
 *           description: ID de la factura asociada
 *         productoId:
 *           type: integer
 *           description: ID del producto asociado
 *         cantidad:
 *           type: integer
 *           description: Cantidad del producto
 *         precioUnitario:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 *         producto:
 *           $ref: '#/components/schemas/Producto'
 *       example:
 *         id: 1
 *         facturaId: 1
 *         productoId: 2
 *         cantidad: 5
 *         precioUnitario: 25.99
 *         producto:
 *           id: 2
 *           nombre: "Smartphone XYZ"
 *           descripcion: "Último modelo con 128GB"
 *           precio: 25.99
 *           stock: 45
 *   responses:
 *     DetalleNotFound:
 *       description: Detalle de factura no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Detalle de factura no encontrado
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
 *     ProductoNotFound:
 *       description: Producto no encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Producto no encontrado
 *     StockInsuficiente:
 *       description: Stock insuficiente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Stock insuficiente
 *               stockDisponible:
 *                 type: integer
 *                 example: 10
 */

/**
 * @swagger
 * /api/detalles/factura/{facturaId}:
 *   get:
 *     summary: Obtiene todos los detalles de una factura específica
 *     tags: [Detalles de Factura]
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Lista de detalles de la factura
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetalleFactura'
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
 *                   example: Error al obtener los detalles de la factura
 */
router.get("/factura/:facturaId", getDetallesByFactura);

/**
 * @swagger
 * /api/detalles/factura/{facturaId}:
 *   post:
 *     summary: Crea un nuevo detalle de factura
 *     tags: [Detalles de Factura]
 *     parameters:
 *       - in: path
 *         name: facturaId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - cantidad
 *               - precioUnitario
 *             properties:
 *               productoId:
 *                 type: integer
 *                 description: ID del producto
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad del producto
 *               precioUnitario:
 *                 type: number
 *                 format: float
 *                 description: Precio unitario del producto
 *             example:
 *               productoId: 2
 *               cantidad: 5
 *               precioUnitario: 25.99
 *     responses:
 *       201:
 *         description: Detalle de factura creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalleFactura'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Todos los campos son requeridos
 *                 - $ref: '#/components/responses/StockInsuficiente'
 *       404:
 *         description: Factura o producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/responses/FacturaNotFound'
 *                 - $ref: '#/components/responses/ProductoNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al crear el detalle de factura
 */
router.post("/factura/:facturaId", createDetalle);

/**
 * @swagger
 * /api/detalles/{id}:
 *   put:
 *     summary: Actualiza un detalle de factura existente
 *     tags: [Detalles de Factura]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de factura
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 description: Nueva cantidad del producto
 *               precioUnitario:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio unitario del producto
 *             example:
 *               cantidad: 10
 *               precioUnitario: 23.50
 *     responses:
 *       200:
 *         description: Detalle de factura actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalleFactura'
 *       400:
 *         $ref: '#/components/responses/StockInsuficiente'
 *       404:
 *         $ref: '#/components/responses/DetalleNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al actualizar el detalle de factura
 */
router.put("/:id", updateDetalle);

/**
 * @swagger
 * /api/detalles/{id}:
 *   delete:
 *     summary: Elimina un detalle de factura
 *     tags: [Detalles de Factura]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de factura
 *     responses:
 *       200:
 *         description: Detalle de factura eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detalle de factura eliminado correctamente
 *       404:
 *         $ref: '#/components/responses/DetalleNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al eliminar el detalle de factura
 */
router.delete("/:id", deleteDetalle);

export default router;