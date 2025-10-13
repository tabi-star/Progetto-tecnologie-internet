// routes/payments.js
import { Router } from "express";
import { initiatePayment, finalizePayment } from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/create-order", authenticateToken, initiatePayment);
router.post("/capture-order", authenticateToken, finalizePayment);

export default router;