import { Router } from "express";
import {
    createOrder,
    acceptOrder,
    completeOrder,
    cancelOrder,
    getOrderById,
    getMyOrders,
    getIncomingRequests,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All order routes require authentication — no public order data
router.use(verifyJWT);

// ── Buyer actions 
router.post("/", createOrder);                          // Send buy request
router.get("/my-orders", getMyOrders);                  // My requests as buyer

// ── Seller actions 
router.get("/incoming", getIncomingRequests);           // Requests received on my listings
router.patch("/:orderId/accept", acceptOrder);          // Accept a request
router.patch("/:orderId/complete", completeOrder);      // Mark done after meetup

// ── Shared actions 
router.get("/:orderId", getOrderById);                  // View single order (buyer or seller)
router.patch("/:orderId/cancel", cancelOrder);          // Cancel (buyer or seller)

export default router;