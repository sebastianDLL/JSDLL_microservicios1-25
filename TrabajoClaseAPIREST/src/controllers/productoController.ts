import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { Producto } from "../entities/Producto";

const productoRepository = AppDataSource.getRepository(Producto);

export const getAllProductos = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepository.find();
    return res.json(productos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
};

export const getProductoById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const producto = await productoRepository.findOne({ where: { id } });
    
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    return res.json(producto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el producto" });
  }
};

export const createProducto = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion, marca, stock } = req.body;
    
    // Validaciones básicas
    if (!nombre || !descripcion || !marca || stock === undefined) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    
    const producto = productoRepository.create({
      nombre,
      descripcion,
      marca,
      stock,
    });
    
    await productoRepository.save(producto);
    return res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el producto" });
  }
};

export const updateProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, descripcion, marca, stock } = req.body;
    
    const producto = await productoRepository.findOne({ where: { id } });
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // Actualizar solo los campos proporcionados
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (marca) producto.marca = marca;
    if (stock !== undefined) producto.stock = stock;
    
    await productoRepository.save(producto);
    return res.json(producto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el producto" });
  }
};

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const producto = await productoRepository.findOne({ 
      where: { id },
      relations: ["detalles"] 
    });
    
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // Verificar si tiene detalles de factura asociados
    if (producto.detalles && producto.detalles.length > 0) {
      return res.status(400).json({ 
        message: "No se puede eliminar el producto porque está asociado a facturas" 
      });
    }
    
    await productoRepository.remove(producto);
    return res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el producto" });
  }
};