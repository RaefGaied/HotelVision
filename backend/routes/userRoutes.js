import express from "express";
import path from "path";
import { userAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { userUpdateValidator } from "../validators/contentValidators.js";

// Controllers
import { createUser, listUsers, deleteUser } from "../controllers/userAdminController.js";
import { getUser, updateUser, profileViews, suggestedFriends } from "../controllers/profileController.js";
import { sendFriendRequest, getFriendRequests, respondToRequest } from "../controllers/friendRequestController.js";
import { register, login, verifyEmail, requestPasswordReset, resetPassword, changePassword } from "../controllers/authController.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

// Admin routes
router.get("/", userAuth, listUsers);
router.post("/", userAuth, userUpdateValidator, validate, createUser);
router.delete("/:id", userAuth, deleteUser);

// Profile routes
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", userAuth, userUpdateValidator, validate, updateUser);

// Friend request routes
router.post('/friend-request', userAuth, sendFriendRequest);
router.post('/get-friend-request', userAuth, getFriendRequests);
router.post("/accept-request", userAuth, respondToRequest);

// Profile interactions
router.post("/profile-view", userAuth, profileViews);
router.post("/suggested-friends", userAuth, suggestedFriends);

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:userId/:token", verifyEmail);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/request-passwordreset", requestPasswordReset);
router.post("/reset-password", changePassword);

// Static pages
router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/verifiedpage.html"));
});
router.get("/resetpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/verifiedpage.html"));
});

export default router;