// routes/users.js
import { Router } from "express";
import { getUsers, addUser } from "../controllers/usersController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", addUser);

export default router;
