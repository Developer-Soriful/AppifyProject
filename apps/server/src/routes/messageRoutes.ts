import { Router } from "express";
import { 
  sendMessage, 
  getConversation, 
  getConversations,
  getUnreadCount 
} from "../controllers/messageController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/conversation/:userId", getConversation);
router.post("/send", sendMessage);

export default router;
