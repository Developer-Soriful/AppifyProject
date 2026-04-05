import { Router } from "express";
import { getSuggestedUsers, getProfile } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/me",         getProfile); // Specific routes first
router.get("/suggested", getSuggestedUsers);
router.get("/:id",        getProfile); // Dynamic route last


export default router;
