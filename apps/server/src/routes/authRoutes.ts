import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import protect from "../middleware/auth.js";
import { required, isEmail, isStrongPassword } from "../middleware/validation.js";

const router = Router();

router.post("/register", required(["firstName", "lastName", "email", "password"]), isEmail, isStrongPassword, register);
router.post("/login",    required(["email", "password"]), login);
router.get("/me",        protect, getMe);

export default router;
