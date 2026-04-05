import { Router } from "express";
import { createPost, getFeed, getPost, updatePost, deletePost, sharePost } from "../controllers/postController.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.get("/",    getFeed);
router.post("/",   upload.single("image"), createPost);
router.get("/:id", getPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);
router.post("/:id/share", sharePost);


export default router;
