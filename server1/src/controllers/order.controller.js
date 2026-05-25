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
// Both buyer and seller are notified by email.

const createOrder = asyncHandler(async (req, res) => {
    const { productId, buyerNote, rentalStartDate, rentalEndDate } = req.body;

    if (!productId) throw new ApiError(400, "Product ID is required");

    // Fetch product with seller's contact info for email notification
    const product = await Product.findById(productId).populate(
        "seller",
        "username fullname email phone notificationPreferences"
    );

    if (!product) throw new ApiError(404, "Product not found");

    // ── Business Rules 

    // Rule 1: Cannot buy your own listing
    if (product.seller._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot buy your own listing");
    }

    // Rule 2: Cannot request a sold product
    if (product.isSold) {
        throw new ApiError(400, "This product is no longer available");
    }

    // Rule 3: Only one pending request per buyer per product
    // Prevents spamming the seller with duplicate requests
    const existingRequest = await Order.findOne({
        buyer: req.user._id,
        product: productId,
        status: "pending",
    });
    if (existingRequest) {
        throw new ApiError(
            400,
            "You already have a pending request for this product. Wait for the seller to respond."
        );
    }

    // ── Rental Validation 
    let totalAmount = product.price;
    let orderType = "purchase";

    if (product.listingType === "rent") {
        if (!rentalStartDate || !rentalEndDate) {
            throw new ApiError(
                400,
                "Rental start and end dates are required for rental listings"
            );
        }

        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);

        if (start >= end) {
            throw new ApiError(400, "Rental end date must be after start date");
        }

        if (start < new Date()) {
            throw new ApiError(400, "Rental start date cannot be in the past");
        }

        // Calculate total: days × price per day
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalAmount = days * product.rentalPricePerDay;
        orderType = "rental";
    }

    // ── Create the Order 
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

    // ── Email Notifications 

    // Notify seller (only if they have email notifications enabled)
    // Seller gets buyer's contact info immediately so they know who is requesting
    if (product.seller.notificationPreferences?.emailOnNewOrder) {
        await sendOrderConfirmation({
            to: product.seller.email,
            recipientName: product.seller.fullname || product.seller.username,
            role: "seller",
            product,
            order,
            contactInfo: {
                name: req.user.fullname || req.user.username,
                phone: req.user.phone || null,
                email: req.user.email, // Buyer's email revealed to seller on request
            },
            extraMessage: buyerNote,
        });
    }

    // FIX: Always notify the buyer regardless of seller's notification settings
    // Buyer must always know their request was sent successfully
    await sendOrderConfirmation({
        to: req.user.email,
        recipientName: req.user.fullname || req.user.username,
        role: "buyer",
        product,
        order,
    });

    // Return populated order data for the frontend
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

// 
// ACCEPT ORDER
// Seller accepts the buyer's request and sets meetup details.
// Both parties get each other's contact info revealed via email.
// 
const acceptOrder = asyncHandler(async (req, res) => {
    const { meetupLocation, meetupTime } = req.body;
    const { orderId } = req.params;

    if (!meetupLocation || !meetupTime) {
        throw new ApiError(
            400,
            "Meetup location and time are required when accepting an order"
        );
    }

    const order = await Order.findById(orderId)
        .populate("product", "title images price category")
        .populate("buyer", "username fullname email phone")
        .populate("seller", "username fullname email phone");

    if (!order) throw new ApiError(404, "Order not found");

    // Only the seller of this specific order can accept it
    if (order.seller._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the seller can accept this order");
    }

    if (order.status !== "pending") {
        throw new ApiError(
            400,
            `Cannot accept an order that is already "${order.status}"`
        );
    }

    // ── Update Order ──────────────────────────────────────────────────────
    order.status = "confirmed";
    order.meetupLocation = meetupLocation.trim();
    order.meetupTime = new Date(meetupTime);
    await order.save();

    // ── Email: Notify Buyer (reveal seller's contact + meetup) ────────────
    // Buyer only gets seller's contact AFTER seller accepts — not before
    await sendOrderConfirmation({
        to: order.buyer.email,
        recipientName: order.buyer.fullname || order.buyer.username,
        role: "buyer-confirmed",
        product: order.product,
        order,
        contactInfo: {
            name: order.seller.fullname || order.seller.username,
            phone: order.seller.phone || null,
            email: order.seller.email, // Seller's contact revealed to buyer on acceptance
        },
        meetup: { location: meetupLocation, time: meetupTime },
    });

    // ── Email: Notify Seller (confirm acceptance + buyer's contact) ───────
    await sendOrderConfirmation({
        to: order.seller.email,
        recipientName: order.seller.fullname || order.seller.username,
        role: "seller-confirmed",
        product: order.product,
        order,
        contactInfo: {
            name: order.buyer.fullname || order.buyer.username,
            phone: order.buyer.phone || null,
            email: order.buyer.email, // Buyer's contact confirmed to seller
        },
        meetup: { location: meetupLocation, time: meetupTime },
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

// 
// COMPLETE ORDER
// Seller marks the order as done after the in-person exchange.
// Marks the product as sold and unlocks the review feature for the buyer.
// Also auto-cancels all other pending requests on the same product.
// 
const completeOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // FIX: Populate seller with _id so comparison is consistent
    const order = await Order.findById(orderId)
        .populate("product")
        .populate("seller", "_id");

    if (!order) throw new ApiError(404, "Order not found");

    // FIX: Use ._id.toString() consistently (order.seller is now populated)
    if (order.seller._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the seller can mark an order as completed");
    }

    if (order.status !== "confirmed") {
        throw new ApiError(
            400,
            `Cannot complete an order with status "${order.status}". Order must be confirmed first.`
        );
    }

    // ── Mark Order as Complete ────────────────────────────────────────────
    order.status = "completed";
    order.completedAt = new Date();
    await order.save();

    // ── Mark Product as Sold (purchase only) ──────────────────────────────
    // Rentals stay available for future rentals after the rental period ends
    if (order.orderType === "purchase") {
        await Product.findByIdAndUpdate(order.product._id, {
            isSold: true,
            soldAt: new Date(),
        });

        // Auto-cancel all other pending requests on this product
        // Other buyers should know the item is no longer available
        await Order.updateMany(
            {
                product: order.product._id,
                status: "pending",
                _id: { $ne: order._id }, // Don't touch the order we just completed
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

// 
// CANCEL ORDER
// Either buyer or seller can cancel before completion.
// Records who cancelled and why for trust/safety tracking.
// 
const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new ApiError(404, "Order not found");

    // Determine if the requester is buyer or seller of THIS order
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
        throw new ApiError(403, "Not authorized to cancel this order");
    }

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


// GET ORDER BY ID
// Both buyer and seller can view their own order.
// Contact info is only revealed after status is "confirmed" or "completed".
// FIX: Use order.toObject() instead of mutating order._doc

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId)
        .populate("product", "title images price category condition listingType")
        .populate("buyer", "username fullname avatar")
        .populate("seller", "username fullname avatar");

    if (!order) throw new ApiError(404, "Order not found");

    // Only the buyer or seller of this order can view it
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
        throw new ApiError(403, "Not authorized to view this order");
    }

    // FIX: Convert to plain JS object FIRST, then attach extra fields
    // Mutating order._doc directly doesn't work because res.json() serializes
    // the Mongoose document, not the internal _doc property
    const orderObj = order.toObject();

    // Reveal contact info only after seller has accepted
    // Before confirmation — contact is hidden to protect privacy
    if (order.status === "confirmed" || order.status === "completed") {
        const [buyer, seller] = await Promise.all([
            User.findById(order.buyer._id).select("phone email"),
            User.findById(order.seller._id).select("phone email"),
        ]);

        // Each party only sees the OTHER person's contact
        if (isBuyer) {
            orderObj.sellerContact = {
                phone: seller.phone || "Not provided",
                email: seller.email || "Not provided",
            };
        }
        if (isSeller) {
            orderObj.buyerContact = {
                phone: buyer.phone || "Not provided",
                email: buyer.email || "Not provided",
            };
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { order: orderObj }, "Order fetched successfully"));
});


// GET MY ORDERS (as buyer)
// All orders placed by the logged-in user with optional status filter

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
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Orders fetched successfully"
        )
    );
});


// GET INCOMING REQUESTS (as seller)
// All buy requests received on the seller's listings

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
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Incoming requests fetched successfully"
        )
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