import express from "express";
import { userAuth } from "../middleware/authMiddleware.js";
import { getPostIdeas } from "../controllers/aiController.js";
import { aiIdeaValidator } from "../validators/contentValidators.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/post-ideas", userAuth, aiIdeaValidator, validate, getPostIdeas);

export default router;
