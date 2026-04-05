import { Router } from "express";
import { getSuggestedUsers, getProfile, updateProfile, getAllUsers } from "../controllers/userController.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.get("/all",          getAllUsers); // Get all users with connection status
router.get("/me",           getProfile); // Specific routes first
router.put("/me",            upload.single("avatar"), updateProfile);
router.get("/suggested",    getSuggestedUsers);
router.get("/:id",          getProfile); // Dynamic route last


export default router;
