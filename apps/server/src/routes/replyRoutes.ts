import { Router } from "express";
import { addReply, getReplies, deleteReply } from "../controllers/replyController.js";
import protect from "../middleware/auth.js";

// mergeParams gives access to :commentId from the parent router
const router = Router({ mergeParams: true });

router.use(protect);

router.get("/",            getReplies);
router.post("/",           addReply);
router.delete("/:replyId", deleteReply);

export default router;
