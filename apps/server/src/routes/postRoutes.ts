import { Router } from "express";
import { createPost, getFeed, getPost, updatePost, deletePost, sharePost, toggleSavePost, getSavedPosts, toggleVisibility, toggleHidePost, getHiddenPosts } from "../controllers/postController.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.get("/",    getFeed);
router.get("/saved", getSavedPosts);
router.get("/hidden", getHiddenPosts);
router.post("/",   upload.single("image"), createPost);
router.get("/:id", getPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);
router.post("/:id/share", sharePost);
router.post("/:id/save", toggleSavePost);
router.post("/:id/hide", toggleHidePost);
router.patch("/:id/visibility", toggleVisibility);


export default router;
