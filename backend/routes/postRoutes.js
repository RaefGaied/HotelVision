import express from "express";
import { userAuth } from "../middleware/authMiddleware.js";
import { createPost, deletePost, getPost, getPosts, getUserPost, likePost, updatePost } from "../controllers/postController.js";
import { commentPost, deleteComment, getComments, likePostComment, replyPostComment, updateComment } from "../controllers/commentController.js";
import { postValidator, commentValidator } from "../validators/contentValidators.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Routes des publications
router.post("/create-post", userAuth, postValidator, validate, createPost);
router.get("/", userAuth, getPosts);
router.get("/:id", userAuth, getPost);
router.get("/get-user-post/:id", userAuth, getUserPost);
router.put("/like/:id", userAuth, likePost);
router.put("/update-post/:id", userAuth, postValidator, validate, updatePost);
router.delete("/:id", userAuth, deletePost);

// Routes des commentaires
router.get("/get-comments/:postId", userAuth, getComments);
router.post("/comment/:id", userAuth, commentValidator, validate, commentPost);
router.post("/reply-comment/:id", userAuth, commentValidator, validate, replyPostComment);
router.put("/like-comment/:id/:rid?", userAuth, likePostComment);
router.put("/update-comment/:id", userAuth, commentValidator, validate, updateComment);
router.delete("/delete-comment/:id", userAuth, deleteComment);

export default router;