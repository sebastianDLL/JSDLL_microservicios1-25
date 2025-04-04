import { Router } from "express";
import { 
  getDetallesByFactura, 
  createDetalle, 
  updateDetalle, 
  deleteDetalle 
} from "../controllers/detalleFacturaController";

const router = Router();

router.get("/factura/:facturaId", getDetallesByFactura);
router.post("/factura/:facturaId", createDetalle);
router.put("/:id", updateDetalle);
router.delete("/:id", deleteDetalle);

export default router;