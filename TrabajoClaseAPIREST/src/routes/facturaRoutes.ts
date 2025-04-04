import { Router } from "express";
import { createFactura, deleteFactura, getAllFacturas, getFacturaById, getFacturasByCliente, updateFactura } from "../controllers/facturaController";

const router = Router();

router.get("/", getAllFacturas);
router.get("/:id", getFacturaById);
router.get("/cliente/:clienteId", getFacturasByCliente);
router.post("/", createFactura);
router.put("/:id", updateFactura);
router.delete("/:id", deleteFactura);

export default router;