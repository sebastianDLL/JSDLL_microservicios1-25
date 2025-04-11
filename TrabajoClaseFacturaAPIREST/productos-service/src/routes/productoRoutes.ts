import { Router } from "express";
import { 
  getAllProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from "../controllers/productoController";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *         - marca
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del producto
 *         marca:
 *           type: string
 *           description: Marca del producto
 *         stock:
 *           type: integer
 *           description: Cantidad disponible en inventario
 *       example:
 *         id: 1
 *         nombre: "Laptop XPS 15"
 *         descripcion: "Laptop de alta gama con procesador i7"
 *         marca: "Dell"
 *         stock: 25
 *   responses:
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
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtiene todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de todos los productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener productos
 */
router.get("/", getAllProductos);

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Información del producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         $ref: '#/components/responses/ProductoNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al obtener el producto
 */
router.get("/:id", getProductoById);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - marca
 *               - stock
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del producto
 *               marca:
 *                 type: string
 *                 description: Marca del producto
 *               stock:
 *                 type: integer
 *                 description: Cantidad disponible en inventario
 *             example:
 *               nombre: "Monitor UltraWide"
 *               descripcion: "Monitor curvo de 34 pulgadas"
 *               marca: "LG"
 *               stock: 15
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o falta información requerida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Todos los campos son requeridos
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al crear el producto
 */
router.post("/", createProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del producto
 *               marca:
 *                 type: string
 *                 description: Marca del producto
 *               stock:
 *                 type: integer
 *                 description: Cantidad disponible en inventario
 *             example:
 *               nombre: "Monitor UltraWide Pro"
 *               descripcion: "Monitor curvo de 34 pulgadas con HDR"
 *               marca: "LG"
 *               stock: 10
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         $ref: '#/components/responses/ProductoNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al actualizar el producto
 */
router.put("/:id", updateProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Producto eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque está asociado a facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No se puede eliminar el producto porque está asociado a facturas
 *       404:
 *         $ref: '#/components/responses/ProductoNotFound'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al eliminar el producto
 */
router.delete("/:id", deleteProducto);

export default router;