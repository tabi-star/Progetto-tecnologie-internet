// routes/users.js
import { Router } from "express";
import { 
  getUsers, 
  getUserWithId,
  addUser, 
  loginUser,
  updateProfile, 
  deleteAccount 
} from "../controllers/usersController.js";
import { 
  forgotPassword,
  verifyResetToken,
  resetPassword 
} from "../controllers/authController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateUser } from "../middleware/validation.js";

const router = Router();

router.get("/", authenticateToken, requireAdmin, getUsers);
router.get("/:id", authenticateToken, requireAdmin, getUserWithId);
router.post("/", validateUser, addUser);
router.post("/login", loginUser);
router.put("/profile", authenticateToken, updateProfile);
router.delete("/account", authenticateToken, deleteAccount);

// Route per il reset password
router.post("/forgot-password", forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;