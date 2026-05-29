import { Router } from "express";
import {
    registerUser,
    verifyOTP,
    resendVerificationOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Public routes (no auth required) 
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendVerificationOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken);

// ── Protected routes (verifyJWT middleware runs first) 
router.post("/logout", verifyJWT, logoutUser);

export default router;