import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { sendOrderConfirmation } from "../services/email.service.js";

// CREATE ORDER (Send Buy Request)
// Buyer sends a request to purchase or rent a product.
// No payment — just creates a "pending" coordination record.
// Seller is notified by email.

const createOrder = asyncHandler(async (req, res) => {
    const { productId, buyerNote, rentalStartDate, rentalEndDate } = req.body;

    if (!productId) throw new ApiError(400, "Product ID is required");

    // ── Fetch product 
    const product = await Product.findById(productId).populate("seller", "username fullname email phone notificationPreferences");

    if (!product) throw new ApiError(404, "Product not found");

    // ── Business rules 

    // Rule 1: Cannot buy your own listing
    if (product.seller._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot buy your own listing");
    }

    // Rule 2: Cannot request a sold/rented out product
    if (product.isSold) {
        throw new ApiError(400, "This product is no longer available");
    }

    // Rule 3: Only one pending request per buyer per product
    // Prevents spamming the seller with multiple requests
    const existingRequest = await Order.findOne({
        buyer: req.user._id,
        product: productId,
        status: "pending",
    });
    if (existingRequest) {
        throw new ApiError(400, "You already have a pending request for this product. Wait for the seller to respond.");
    }

    // ── Rental validation 
    let totalAmount = product.price;
    let orderType = "purchase";

    if (product.listingType === "rent") {
        if (!rentalStartDate || !rentalEndDate) {
            throw new ApiError(400, "Rental start and end dates are required for rental listings");
        }

        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);

        if (start >= end) {
            throw new ApiError(400, "Rental end date must be after start date");
        }

        if (start < new Date()) {
            throw new ApiError(400, "Rental start date cannot be in the past");
        }

        // Calculate total rental cost: days × price per day
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalAmount = days * product.rentalPricePerDay;
        orderType = "rental";
    }

    // ── Create the order 
    const order = await Order.create({
        buyer: req.user._id,
        seller: product.seller._id,
        product: productId,
        totalAmount,
        orderType,
        buyerNote: buyerNote?.trim() || "",
        status: "pending",
        ...(orderType === "rental" && {
            rentalStartDate: new Date(rentalStartDate),
            rentalEndDate: new Date(rentalEndDate),
        }),
    });

    // ── Notify seller by email 
    // Only send if seller has email notifications enabled
    if (product.seller.notificationPreferences?.emailOnNewOrder) {
        await sendOrderConfirmation({
            to: product.seller.email,
            recipientName: product.seller.fullname || product.seller.username,
            role: "seller",
            product,
            order,
            extraMessage: `Buyer's note: "${buyerNote || "No note provided"}"`,
        });
    }

    const populatedOrder = await Order.findById(order._id)
        .populate("product", "title images price category listingType")
        .populate("seller", "username fullname avatar");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { order: populatedOrder },
                "Buy request sent successfully. Wait for the seller to accept."
            )
        );
});


// ACCEPT ORDER
// Seller accepts the buyer's request.
// Both parties get each other's contact details revealed via email.
// Seller provides meetup location and time.

const acceptOrder = asyncHandler(async (req, res) => {
    const { meetupLocation, meetupTime } = req.body;
    const { orderId } = req.params;

    if (!meetupLocation || !meetupTime) {
        throw new ApiError(400, "Meetup location and time are required when accepting an order");
    }

    const order = await Order.findById(orderId)
        .populate("product", "title images price category")
        .populate("buyer", "username fullname email phone")
        .populate("seller", "username fullname email phone");

    if (!order) throw new ApiError(404, "Order not found");

    // Only the seller of this order can accept it
    if (order.seller._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the seller can accept this order");
    }

    if (order.status !== "pending") {
        throw new ApiError(400, `Cannot accept an order that is already "${order.status}"`);
    }

    // ── Update order status 
    order.status = "confirmed";
    order.meetupLocation = meetupLocation.trim();
    order.meetupTime = new Date(meetupTime);
    await order.save();

    // ── Reveal contact info to both parties via email 
    // Buyer gets seller's phone + meetup details
    await sendOrderConfirmation({
        to: order.buyer.email,
        recipientName: order.buyer.fullname || order.buyer.username,
        role: "buyer",
        product: order.product,
        order,
        contactInfo: {
            name: order.seller.fullname || order.seller.username,
            phone: order.seller.phone || "Not provided",
        },
        meetup: { location: meetupLocation, time: new Date(meetupTime) },
    });

    // Seller gets buyer's phone
    await sendOrderConfirmation({
        to: order.seller.email,
        recipientName: order.seller.fullname || order.seller.username,
        role: "seller-confirmed",
        product: order.product,
        order,
        contactInfo: {
            name: order.buyer.fullname || order.buyer.username,
            phone: order.buyer.phone || "Not provided",
        },
        meetup: { location: meetupLocation, time: new Date(meetupTime) },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { order },
                "Order accepted. Contact details have been shared with the buyer."
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE ORDER
// Seller marks the order as done after in-person exchange.
// This marks the product as sold and unlocks the review for the buyer.
// ─────────────────────────────────────────────────────────────────────────────
const completeOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("product");

    if (!order) throw new ApiError(404, "Order not found");

    // Only the seller confirms the physical exchange happened
    if (order.seller.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the seller can mark an order as completed");
    }

    if (order.status !== "confirmed") {
        throw new ApiError(400, `Cannot complete an order that is "${order.status}". Order must be confirmed first.`);
    }

    // ── Mark order complete ───────────────────────────────────────────────
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // ── Mark product as sold ──────────────────────────────────────────────
    // For purchases: permanently sold — no more requests
    // For rentals: stays available for future rentals after end date
    if (order.orderType === "purchase") {
        await Product.findByIdAndUpdate(order.product._id, {
            isSold: true,
            soldAt: new Date(),
        });
    }

    // ── Cancel all other pending requests on this product ─────────────────
    // Other buyers who requested this product should be notified it's gone
    if (order.orderType === "purchase") {
        await Order.updateMany(
            {
                product: order.product._id,
                status: "pending",
                _id: { $ne: order._id }, // Don't cancel the order we just completed
            },
            {
                status: "cancelled",
                cancelledBy: "seller",
                cancelReason: "Item has been sold to another buyer",
                cancelledAt: new Date(),
            }
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { order },
                "Order marked as completed. The buyer can now leave a review."
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL ORDER
// Either buyer or seller can cancel before completion.
// Seller cancelling a confirmed order is a bad signal for their reputation.
// ─────────────────────────────────────────────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new ApiError(404, "Order not found");

    // Only buyer or seller of THIS order can cancel
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
        throw new ApiError(403, "Not authorized to cancel this order");
    }

    // Cannot cancel a completed order
    if (order.status === "completed") {
        throw new ApiError(400, "Cannot cancel a completed order");
    }

    if (order.status === "cancelled") {
        throw new ApiError(400, "Order is already cancelled");
    }

    order.status = "cancelled";
    order.cancelledBy = isBuyer ? "buyer" : "seller";
    order.cancelReason = cancelReason?.trim() || "";
    order.cancelledAt = new Date();
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { order }, "Order cancelled successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ORDER BY ID
// Both buyer and seller can view their own order details
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId)
        .populate("product", "title images price category condition listingType")
        .populate("buyer", "username fullname avatar")
        .populate("seller", "username fullname avatar");

    if (!order) throw new ApiError(404, "Order not found");

    // Privacy: only the buyer or seller of this order can view it
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
        throw new ApiError(403, "Not authorized to view this order");
    }

    // ── Reveal contact info only after order is confirmed ──────────────────
    // Before confirmation, hide phone numbers — seller hasn't agreed yet
    if (order.status === "confirmed" || order.status === "completed") {
        // Fetch phone numbers separately (select:false on schema means populate won't include them)
        const [buyer, seller] = await Promise.all([
            User.findById(order.buyer._id).select("phone"),
            User.findById(order.seller._id).select("phone"),
        ]);

        // Attach contact info based on who is viewing
        order._doc = order.toObject();
        if (isBuyer) {
            order._doc.sellerContact = { phone: seller.phone || "Not provided" };
        }
        if (isSeller) {
            order._doc.buyerContact = { phone: buyer.phone || "Not provided" };
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { order }, "Order fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET MY ORDERS (as buyer)
// All orders placed by the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { buyer: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate("product", "title images price category")
            .populate("seller", "username fullname avatar averageRating")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        }, "Orders fetched successfully")
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET INCOMING REQUESTS (as seller)
// All buy requests received on the seller's listings
// ─────────────────────────────────────────────────────────────────────────────
const getIncomingRequests = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { seller: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate("product", "title images price category")
            .populate("buyer", "username fullname avatar college phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        }, "Incoming requests fetched successfully")
    );
});

export {
    createOrder,
    acceptOrder,
    completeOrder,
    cancelOrder,
    getOrderById,
    getMyOrders,
    getIncomingRequests,
};