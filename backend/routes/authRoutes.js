import express from "express";
import { login, register, verifyEmail, requestPasswordReset, resetPassword, changePassword } from "../controllers/authController.js";
import { registerValidator, loginValidator, passwordResetValidator } from "../validators/authValidators.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/verify/:userId/:token", verifyEmail);
router.post("/request-passwordreset", passwordResetValidator, validate, requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", passwordResetValidator, validate, changePassword);

export default router;