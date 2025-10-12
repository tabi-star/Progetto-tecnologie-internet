// routes/users.js
import { Router } from "express";
import { getUsers, addUser, loginUser, updateProfile, deleteAccount } from "../controllers/usersController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateUser } from "../middleware/validation.js";

const router = Router();

router.get("/", authenticateToken, requireAdmin, getUsers);
router.post("/", validateUser, addUser);
router.post("/login", loginUser);
router.put("/profile", authenticateToken, updateProfile);
router.delete("/account", authenticateToken, deleteAccount);

export default router;