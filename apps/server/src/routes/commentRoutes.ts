import { Router } from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import protect from "../middleware/auth.js";

// mergeParams gives access to :postId from the parent router
const router = Router({ mergeParams: true });

router.use(protect);

router.get("/",              getComments);
router.post("/",             addComment);
router.delete("/:commentId", deleteComment);

export default router;
