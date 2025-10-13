// routes/discounts.js
import { Router } from "express";
import { generateDiscountCode, getMyDiscountCodes, validateDiscountCode, useDiscountCode } from "../controllers/discountController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/generate", authenticateToken, requireAdmin, generateDiscountCode);
router.get("/my-codes", authenticateToken, requireAdmin, getMyDiscountCodes);
router.post("/validate", authenticateToken, validateDiscountCode);
router.post("/use", authenticateToken, useDiscountCode);

export default router;