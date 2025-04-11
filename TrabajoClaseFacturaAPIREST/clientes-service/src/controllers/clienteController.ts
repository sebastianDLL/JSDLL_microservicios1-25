import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { Cliente } from "../entities/Cliente";

const clienteRepository = AppDataSource.getRepository(Cliente);

export const getAllClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await clienteRepository.find();
    return res.json(clientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener clientes" });
  }
};

export const getClienteById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const cliente = await clienteRepository.findOne({ where: { id } });
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    return res.json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el cliente" });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { ci, nombres, apellidos, sexo } = req.body;
    
    // Validaciones básicas
    if (!ci || !nombres || !apellidos || !sexo) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    
    const existingCliente = await clienteRepository.findOne({ where: { ci } });
    if (existingCliente) {
      return res.status(400).json({ message: "Ya existe un cliente con ese CI" });
    }
    
    const cliente = clienteRepository.create({
      ci,
      nombres,
      apellidos,
      sexo
    });
    
    await clienteRepository.save(cliente);
    return res.status(201).json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el cliente" });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { ci, nombres, apellidos, sexo } = req.body;
    
    const cliente = await clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    // Si se cambia el CI, verificar que no exista otro con ese CI
    if (ci && ci !== cliente.ci) {
      const existingCliente = await clienteRepository.findOne({ where: { ci } });
      if (existingCliente && existingCliente.id !== id) {
        return res.status(400).json({ message: "Ya existe otro cliente con ese CI" });
      }
    }
    
    // Actualizar solo los campos proporcionados
    if (ci) cliente.ci = ci;
    if (nombres) cliente.nombres = nombres;
    if (apellidos) cliente.apellidos = apellidos;
    if (sexo) cliente.sexo = sexo;
    
    await clienteRepository.save(cliente);
    return res.json(cliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el cliente" });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const cliente = await clienteRepository.findOne({ where: { id } });
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    // Nota: Ya no verificamos si tiene facturas asociadas aquí
    // eso se manejará desde el microservicio de facturas
    
    await clienteRepository.remove(cliente);
    return res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al eliminar el cliente" });
  }
};