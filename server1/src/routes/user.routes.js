import { Router } from "express";
import {
    getMyProfile,
    editProfile,
    updateAvatar,
    removeAvatar,
    changePassword,
    getMyListings,
    getPurchaseHistory,
    getSalesHistory,
    getActiveRentals,
    getPublicProfile,
    submitReview,
    getSellerReviews,
    deleteAccount,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ── All routes below require the user to be logged in
router.use(verifyJWT);

// ── Own profile 
router.get("/profile", getMyProfile);
router.patch("/profile", editProfile);

// ── Avatar
// upload.single("avatar") → Multer processes the "avatar" field from form-data
router.patch("/avatar", upload.single("avatar"), updateAvatar);
router.delete("/avatar", removeAvatar);

// ── Password 
router.post("/change-password", changePassword);

// ── Listings & history
router.get("/my-listings", getMyListings);
router.get("/purchase-history", getPurchaseHistory);
router.get("/sales-history", getSalesHistory);
router.get("/active-rentals", getActiveRentals);

// ── Reviews 
router.post("/reviews", submitReview);

// ── Account 
router.delete("/account", deleteAccount);

// ── Public routes (no auth required — place AFTER router.use(verifyJWT)) ─────
// These override the global verifyJWT for these specific paths
router.get("/:username/profile", getPublicProfile);
router.get("/:username/reviews", getSellerReviews);

export default router;