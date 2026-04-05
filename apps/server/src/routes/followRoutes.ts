import { Router } from "express";
import { 
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequests,
  getSentRequests,
  checkFollowStatus,
  unfollow,
  getFollowers, 
  getFollowing 
} from "../controllers/followController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.use(protect);

// Connection request endpoints
router.post("/request/:userId", sendConnectionRequest);
router.post("/accept/:userId", acceptConnectionRequest);
router.post("/reject/:userId", rejectConnectionRequest);
router.get("/pending", getPendingRequests);
router.get("/sent", getSentRequests);

// Follow management
router.get("/status/:userId", checkFollowStatus);
router.delete("/unfollow/:userId", unfollow);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);

export default router;
