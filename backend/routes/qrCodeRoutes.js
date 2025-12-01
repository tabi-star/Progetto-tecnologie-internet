import { Router } from "express";
import { 
  verifyQRCode, 
  validateAndUseTicket 
} from "../controllers/qrCodeController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Route per verificare un QR code (solo admin/personale autorizzato)
router.post("/verify", authenticateToken, requireAdmin, verifyQRCode);

// Route per validare e utilizzare il ticket (solo admin/personale autorizzato)
router.post("/validate", authenticateToken, requireAdmin, validateAndUseTicket);

export default router;