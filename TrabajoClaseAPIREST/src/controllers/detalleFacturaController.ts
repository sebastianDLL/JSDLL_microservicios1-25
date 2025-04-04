import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { DetalleFactura } from "../entities/DetalleFactura";
import { Factura } from "../entities/Factura";
import { Producto } from "../entities/Producto";

const detalleRepository = AppDataSource.getRepository(DetalleFactura);
const facturaRepository = AppDataSource.getRepository(Factura);
const productoRepository = AppDataSource.getRepository(Producto);

export const getDetallesByFactura = async (req: Request, res: Response) => {
  try {
    const facturaId = parseInt(req.params.facturaId);
    
    // Verificar que la factura existe
    const factura = await facturaRepository.findOne({ where: { id: facturaId } });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    const detalles = await detalleRepository.find({
      where: { facturaId },
      relations: ["producto"]
    });
    
    return res.json(detalles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los detalles de la factura" });
  }
};

export const createDetalle = async (req: Request, res: Response) => {
  try {
    const facturaId = parseInt(req.params.facturaId);
    const { productoId, cantidad, precioUnitario } = req.body;
    
    // Validaciones básicas
    if (!productoId || !cantidad || !precioUnitario) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    
    // Verificar que la factura existe
    const factura = await facturaRepository.findOne({ where: { id: facturaId } });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    // Verificar que el producto existe y tiene suficiente stock
    const producto = await productoRepository.findOne({ where: { id: productoId } });
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    if (producto.stock < cantidad) {
      return res.status(400).json({ 
        message: "Stock insuficiente",
        stockDisponible: producto.stock
      });
    }
    
    // Crear el detalle
    const detalle = detalleRepository.create({
      facturaId,
      productoId,
      cantidad,
      precioUnitario
    });
    
    await detalleRepository.save(detalle);
    
    // Actualizar el stock del producto
    producto.stock -= cantidad;
    await productoRepository.save(producto);
    
    return res.status(201).json(detalle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el detalle de factura" });
  }
};

export const updateDetalle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { cantidad, precioUnitario } = req.body;
    
    const detalle = await detalleRepository.findOne({ 
      where: { id },
      relations: ["producto"]
    });
    
    if (!detalle) {
      return res.status(404).json({ message: "Detalle de factura no encontrado" });
    }
    
    // Si se cambia la cantidad, actualizar el stock del producto
    if (cantidad && cantidad !== detalle.cantidad) {
      const diferencia = cantidad - detalle.cantidad;
      
      // Verificar si hay suficiente stock si la cantidad aumenta
      if (diferencia > 0 && detalle.producto.stock < diferencia) {
        return res.status(400).json({ 
          message: "Stock insuficiente",
          stockDisponible: detalle.producto.stock
        });
      }
      
      // Actualizar el stock del producto
      detalle.producto.stock -= diferencia;
      await productoRepository.save(detalle.producto);
      
      detalle.cantidad = cantidad;
    }
    
    if (precioUnitario) {
      detalle.precioUnitario = precioUnitario;
    }
    
    await detalleRepository.save(detalle);
    return res.json(detalle);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el detalle de factura" });
  }
};

export const deleteDetalle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const detalle = await detalleRepository.findOne({ 
      where: { id },
      relations: ["producto"]
    });
    
    if (!detalle) {
      return res.status(404).json({ message: "Detalle de factura no encontrado" });
    }
    
    // Restaurar el stock del producto
    detalle.producto.stock += detalle.cantidad;
    await productoRepository.save(detalle.producto);
    
    await detalleRepository.remove(detalle);
    return res.json({ message: "Detalle de factura eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el detalle de factura" });
  }
};