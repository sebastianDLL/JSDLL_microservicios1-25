import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { Factura } from "../entities/Factura";
import { Cliente } from "../entities/Cliente";

const facturaRepository = AppDataSource.getRepository(Factura);
const clienteRepository = AppDataSource.getRepository(Cliente);

export const getAllFacturas = async (req: Request, res: Response) => {
  try {
    const facturas = await facturaRepository.find({
      relations: ["cliente"]
    });
    return res.json(facturas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener facturas" });
  }
};

export const getFacturaById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const factura = await facturaRepository.findOne({ 
      where: { id },
      relations: ["cliente"]
    });
    
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    return res.json(factura);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener la factura" });
  }
};

export const getFacturasByCliente = async (req: Request, res: Response) => {
  try {
    const clienteId = parseInt(req.params.clienteId);
    
    // Verificar que el cliente existe
    const cliente = await clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    const facturas = await facturaRepository.find({
      where: { clienteId },
      relations: ["cliente"]
    });
    
    return res.json(facturas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener las facturas del cliente" });
  }
};

export const createFactura = async (req: Request, res: Response) => {
  try {
    const { clienteId } = req.body;
    
    // Validar que el cliente existe
    const cliente = await clienteRepository.findOne({ where: { id: clienteId } });
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    const factura = facturaRepository.create({
      clienteId,
      fecha: new Date()
    });
    
    await facturaRepository.save(factura);
    
    // Obtener la factura con las relaciones
    const savedFactura = await facturaRepository.findOne({ 
      where: { id: factura.id },
      relations: ["cliente"]
    });
    
    return res.status(201).json(savedFactura);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear la factura" });
  }
};

export const updateFactura = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { clienteId } = req.body;
    
    const factura = await facturaRepository.findOne({ where: { id } });
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    // Si se proporciona un nuevo cliente, verificar que existe
    if (clienteId) {
      const cliente = await clienteRepository.findOne({ where: { id: clienteId } });
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      factura.clienteId = clienteId;
    }
    
    await facturaRepository.save(factura);
    
    // Obtener la factura actualizada con las relaciones
    const updatedFactura = await facturaRepository.findOne({ 
      where: { id },
      relations: ["cliente"]
    });
    
    return res.json(updatedFactura);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar la factura" });
  }
};

export const deleteFactura = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const factura = await facturaRepository.findOne({ 
      where: { id },
      relations: ["detalles"]
    });
    
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    await facturaRepository.remove(factura);
    return res.json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar la factura" });
  }
};