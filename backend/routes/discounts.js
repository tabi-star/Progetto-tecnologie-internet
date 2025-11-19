// routes/discounts.js
import { Router } from "express";
import { generateDiscountCode, removeDiscountCode, getMyDiscountCodes, validateDiscountCode, useDiscountCode } from "../controllers/discountController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/generate", authenticateToken, requireAdmin, generateDiscountCode);
router.delete("/:id", authenticateToken, requireAdmin, removeDiscountCode); // ✅ AGGIUNTO MIDDLEWARE
router.get("/my-codes", authenticateToken, requireAdmin, getMyDiscountCodes);
router.post("/validate", authenticateToken, validateDiscountCode);
router.post("/use", authenticateToken, useDiscountCode);

export default router;