import { Router } from "express";
import { toggleLike, getLikes } from "../controllers/likeController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post("/:targetType/:targetId", toggleLike);
router.get("/:targetType/:targetId",  getLikes);

export default router;
