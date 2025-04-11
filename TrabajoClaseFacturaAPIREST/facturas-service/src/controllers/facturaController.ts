import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { Factura, DetalleFactura } from "../entities/Factura";
import axios from "axios";

const facturaRepository = AppDataSource.getRepository(Factura);

// Configuración de los endpoints de los otros microservicios
const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || "http://localhost:3002/api/clientes";
const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || "http://localhost:3001/api/productos";

// Función para verificar si un cliente existe
async function verificarCliente(clienteId: number): Promise<boolean> {
  try {
    const response = await axios.get(`${CLIENTES_SERVICE_URL}/${clienteId}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Función para verificar si un producto existe y tiene stock suficiente
async function verificarProducto(productoId: number, cantidad: number): Promise<{ existe: boolean, stockSuficiente: boolean }> {
  try {
    const response = await axios.get(`${PRODUCTOS_SERVICE_URL}/${productoId}`);
    if (response.status !== 200) {
      return { existe: false, stockSuficiente: false };
    }
    
    const producto = response.data;
    return { 
      existe: true, 
      stockSuficiente: producto.stock >= cantidad 
    };
  } catch (error) {
    return { existe: false, stockSuficiente: false };
  }
}

// Función para actualizar el stock de un producto
async function actualizarStockProducto(productoId: number, cantidad: number): Promise<boolean> {
  try {
    // Primero obtenemos el producto para conocer su stock actual
    const getResponse = await axios.get(`${PRODUCTOS_SERVICE_URL}/${productoId}`);
    if (getResponse.status !== 200) {
      return false;
    }
    
    const producto = getResponse.data;
    const nuevoStock = producto.stock - cantidad;
    
    // Actualizamos el stock
    const updateResponse = await axios.put(`${PRODUCTOS_SERVICE_URL}/${productoId}`, {
      stock: nuevoStock
    });
    
    return updateResponse.status === 200;
  } catch (error) {
    console.error(`Error al actualizar stock del producto ${productoId}:`, error);
    return false;
  }
}

// Controladores
export const getAllFacturas = async (req: Request, res: Response) => {
  try {
    const facturas = await facturaRepository.find();
    
    // Calculamos el total para cada factura
    const facturasConTotal = facturas.map(factura => {
      const total = factura.calcularTotal();
      return { ...factura, total };
    });
    
    return res.json(facturasConTotal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener facturas" });
  }
};

export const getFacturaById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const factura = await facturaRepository.findOne({ where: { id } });
    
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    // Calculamos el total
    const total = factura.calcularTotal();
    
    // Intentamos obtener información adicional del cliente
    let clienteInfo = null;
    try {
      const clienteResponse = await axios.get(`${CLIENTES_SERVICE_URL}/${factura.clienteId}`);
      if (clienteResponse.status === 200) {
        clienteInfo = clienteResponse.data;
      }
    } catch (error) {
      console.error("Error al obtener info del cliente:", error);
    }
    
    // Intentamos obtener información de los productos
    const detallesConProducto = await Promise.all(
      factura.detalles.map(async (detalle) => {
        try {
          const productoResponse = await axios.get(`${PRODUCTOS_SERVICE_URL}/${detalle.productoId}`);
          if (productoResponse.status === 200) {
            return {
              ...detalle,
              producto: productoResponse.data,
              subtotal: detalle.cantidad * detalle.precioUnitario
            };
          }
          return { ...detalle, subtotal: detalle.cantidad * detalle.precioUnitario };
        } catch (error) {
          return { ...detalle, subtotal: detalle.cantidad * detalle.precioUnitario };
        }
      })
    );
    
    return res.json({
      ...factura,
      cliente: clienteInfo,
      detalles: detallesConProducto,
      total
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener la factura" });
  }
};

export const createFactura = async (req: Request, res: Response) => {
  try {
    const { clienteId, detalles } = req.body;
    
    // Validaciones básicas
    if (!clienteId || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: "Datos de factura inválidos" });
    }
    
    // Verificar si el cliente existe
    const clienteExiste = await verificarCliente(clienteId);
    if (!clienteExiste) {
      return res.status(400).json({ message: "El cliente especificado no existe" });
    }
    
    // Verificar cada producto y su stock
    for (const detalle of detalles) {
      const { productoId, cantidad } = detalle;
      
      if (!productoId || !cantidad || cantidad <= 0) {
        return res.status(400).json({ 
          message: "Datos de detalle inválidos", 
          detalle 
        });
      }
      
      const verificacion = await verificarProducto(productoId, cantidad);
      
      if (!verificacion.existe) {
        return res.status(400).json({ 
          message: `El producto con ID ${productoId} no existe` 
        });
      }
      
      if (!verificacion.stockSuficiente) {
        return res.status(400).json({ 
          message: `Stock insuficiente para el producto con ID ${productoId}` 
        });
      }
    }
    
    // Crear la factura
    const factura = facturaRepository.create({
      clienteId,
      detalles: detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    });
    
    // Guardar la factura
    await facturaRepository.save(factura);
    
    // Actualizar el stock de cada producto
    for (const detalle of detalles) {
      await actualizarStockProducto(detalle.productoId, detalle.cantidad);
    }
    
    // Calculamos el total
    const total = factura.calcularTotal();
    
    return res.status(201).json({ ...factura, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear la factura" });
  }
};

export const updateFactura = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { clienteId, detalles } = req.body;
    
    const factura = await facturaRepository.findOne({ where: { id } });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    // Por simplicidad, no permitimos actualizar los detalles directamente
    // ya que implicaría gestionar el stock de manera más compleja
    if (detalles) {
      return res.status(400).json({ 
        message: "No se permite actualizar los detalles de una factura, cree una nueva factura" 
      });
    }
    
    // Si se cambia el cliente, verificar que exista
    if (clienteId && clienteId !== factura.clienteId) {
      const clienteExiste = await verificarCliente(clienteId);
      if (!clienteExiste) {
        return res.status(400).json({ message: "El cliente especificado no existe" });
      }
      factura.clienteId = clienteId;
    }
    
    await facturaRepository.save(factura);
    
    // Calculamos el total
    const total = factura.calcularTotal();
    
    return res.json({ ...factura, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar la factura" });
  }
};

export const deleteFactura = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const factura = await facturaRepository.findOne({ where: { id } });
    
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    // Devolver el stock a los productos antes de eliminar la factura
    for (const detalle of factura.detalles) {
      try {
        // Obtenemos el producto para conocer su stock actual
        const getResponse = await axios.get(`${PRODUCTOS_SERVICE_URL}/${detalle.productoId}`);
        if (getResponse.status === 200) {
          const producto = getResponse.data;
          const nuevoStock = producto.stock + detalle.cantidad;
          
          // Actualizamos el stock
          await axios.put(`${PRODUCTOS_SERVICE_URL}/${detalle.productoId}`, {
            stock: nuevoStock
          });
        }
      } catch (error) {
        console.error(`Error al restaurar stock del producto ${detalle.productoId}:`, error);
      }
    }
    
    await facturaRepository.remove(factura);
    return res.json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar la factura" });
  }
};
