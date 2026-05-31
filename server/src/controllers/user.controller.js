import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET OWN PROFILE
// Returns the logged-in user's full private profile
// req.user is set by verifyJWT middleware
// ─────────────────────────────────────────────────────────────────────────────
const getMyProfile = asyncHandler(async (req, res) => {
    // Fetch user and compute live stats in parallel for performance
    const [user, totalListings, activeListings] = await Promise.all([
        User.findById(req.user._id).select(
            "-password -refreshToken -emailVerificationOTP -emailVerificationOTPExpiry -passwordResetOTP -passwordResetOTPExpiry -avatarPublicId"
        ),
        // Total products this user has ever listed (not deleted)
        Product.countDocuments({ seller: req.user._id }),
        // Currently active (unsold) listings
        Product.countDocuments({ seller: req.user._id, isSold: false }),
    ]);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Attach computed stats to the response without saving to DB
    // (averageRating and totalRatings are already on the model, updated by submitReview)
    const userObj = user.toObject();
    userObj.totalListings  = totalListings;
    userObj.activeListings = activeListings;

    return res
        .status(200)
        .json(new ApiResponse(200, { user: userObj }, "Profile fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// EDIT PROFILE
// Only allows updating safe fields — email, password, role are NOT editable here
// ─────────────────────────────────────────────────────────────────────────────
const editProfile = asyncHandler(async (req, res) => {
    const { fullname, phone, college, bio, notificationPreferences } = req.body;

    // Build update object dynamically — only include fields that were actually sent
    // This prevents overwriting existing values with undefined
    const updateFields = {};
    if (fullname !== undefined) updateFields.fullname = fullname.trim();
    if (phone !== undefined) updateFields.phone = phone;
    if (college !== undefined) updateFields.college = college.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();

    // Handle nested notification preferences — merge instead of replace
    if (notificationPreferences !== undefined) {
        if (notificationPreferences.emailOnNewOrder !== undefined) {
            updateFields["notificationPreferences.emailOnNewOrder"] =
                notificationPreferences.emailOnNewOrder;
        }
        if (notificationPreferences.emailOnOrderUpdate !== undefined) {
            updateFields["notificationPreferences.emailOnOrderUpdate"] =
                notificationPreferences.emailOnOrderUpdate;
        }
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },     // $set only updates specified fields, leaves others unchanged
        { new: true, runValidators: true }  // new:true returns updated doc, runValidators checks schema rules
    ).select("-password -refreshToken -emailVerificationOTP -emailVerificationOTPExpiry -passwordResetOTP -passwordResetOTPExpiry -avatarPublicId");

    return res
        .status(200)
        .json(new ApiResponse(200, { user: updatedUser }, "Profile updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD / CHANGE AVATAR
// Flow: Multer saves file to disk → we upload to Cloudinary → delete old image
// → save new URL and public_id to user document → delete temp file
// ─────────────────────────────────────────────────────────────────────────────
const updateAvatar = asyncHandler(async (req, res) => {
    // req.file is set by Multer middleware (upload.single("avatar"))
    if (!req.file?.path) {
        throw new ApiError(400, "Avatar image is required");
    }

    // Get the user with avatarPublicId (select:false so we need + prefix)
    const user = await User.findById(req.user._id).select("+avatarPublicId");

    // Upload new image to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.path, "campus_marketplace/avatars");
    if (!uploadResult?.url) {
        throw new ApiError(500, "Failed to upload avatar. Please try again.");
    }

    // Delete OLD avatar from Cloudinary if one exists
    // Do this AFTER successful upload so user is never left with no avatar
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }

    // Save new avatar URL and public_id to DB
    user.avatar = uploadResult.url;
    user.avatarPublicId = uploadResult.public_id;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { avatar: uploadResult.url },
                "Avatar updated successfully"
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────────
// REMOVE AVATAR
// Deletes from Cloudinary and clears the avatar field
// ─────────────────────────────────────────────────────────────────────────────
const removeAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+avatarPublicId");

    if (!user.avatar) {
        throw new ApiError(400, "No avatar to remove");
    }

    // Delete from Cloudinary
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }

    // Clear avatar fields
    user.avatar = "";
    user.avatarPublicId = "";
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Avatar removed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE PASSWORD
// Requires current password confirmation — prevents unauthorized changes
// if someone gets access to an already-logged-in session
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters");
    }

    if (currentPassword === newPassword) {
        throw new ApiError(400, "New password must be different from current password");
    }

    // Fetch user with password (select:false on schema)
    const user = await User.findById(req.user._id).select("+password");

    // Verify the current password is correct before allowing the change
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Assign new password — the pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();  // Full save (no validateBeforeSave:false) to trigger the hook

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully. Please login again."));
});

// ─────────────────────────────────────────────────────────────────────────────
// MY LISTINGS
// Returns all products listed by the logged-in user with pagination
// Supports filter by status: all | active (unsold) | sold
// ─────────────────────────────────────────────────────────────────────────────
const getMyListings = asyncHandler(async (req, res) => {
    const { status = "all", page = 1, limit = 10 } = req.query;

    // Build filter — always scope to this seller
    const filter = { seller: req.user._id };

    if (status === "active") filter.isSold = false;
    if (status === "sold") filter.isSold = true;
    // status === "all" → no isSold filter

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Run count and data fetch in parallel for better performance
    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })    // Newest first
            .skip(skip)
            .limit(parseInt(limit)),
        Product.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Listings fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE HISTORY
// Orders where the logged-in user is the buyer
// Populates product and seller info so frontend can display useful details
// ─────────────────────────────────────────────────────────────────────────────
const getPurchaseHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find({ buyer: req.user._id })
            .populate("product", "title images category price condition")   // Only pull needed fields
            .populate("seller", "username fullname avatar averageRating")   // Seller info for display
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments({ buyer: req.user._id }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Purchase history fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// SALES HISTORY
// Orders where the logged-in user is the seller
// ─────────────────────────────────────────────────────────────────────────────
const getSalesHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find({ seller: req.user._id })
            .populate("product", "title images category price condition")
            .populate("buyer", "username fullname avatar")   // Buyer's basic info
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments({ seller: req.user._id }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Sales history fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE RENTALS
// Orders where user is buyer OR seller, orderType is rental, and not yet ended
// ─────────────────────────────────────────────────────────────────────────────
const getActiveRentals = asyncHandler(async (req, res) => {
    const now = new Date();

    const rentals = await Order.find({
        $or: [{ buyer: req.user._id }, { seller: req.user._id }],
        orderType: "rental",
        status: "confirmed",
        rentalEndDate: { $gt: now },    // End date is in the future — still active
    })
        .populate("product", "title images category price")
        .populate("buyer", "username fullname avatar")
        .populate("seller", "username fullname avatar")
        .sort({ rentalEndDate: 1 });    // Soonest ending first — most urgent to see

    return res
        .status(200)
        .json(new ApiResponse(200, { rentals }, "Active rentals fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PROFILE
// Visible to anyone — shows safe public info only
// Used when browsing seller profiles or clicking on a seller's name
// ─────────────────────────────────────────────────────────────────────────────
const getPublicProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username }).select(
        "username fullname avatar college bio averageRating totalRatings role createdAt"
        // Only expose public fields — no email, phone, tokens, OTPs
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Run all data fetches in parallel for performance
    const [listings, reviews, totalListings, activeListings] = await Promise.all([
        // Latest 6 active listings for preview
        Product.find({ seller: user._id, isSold: false })
            .select("title images price category condition listingType rentalPricePerDay createdAt")
            .sort({ createdAt: -1 })
            .limit(6),
        // Latest 10 reviews for this seller
        Review.find({ seller: user._id })
            .populate("reviewer", "username fullname avatar")
            .sort({ createdAt: -1 })
            .limit(10),
        // Real total listing count (not capped at 6)
        Product.countDocuments({ seller: user._id }),
        // Active listing count
        Product.countDocuments({ seller: user._id, isSold: false }),
    ]);

    const userObj = user.toObject();
    userObj.totalListings  = totalListings;
    userObj.activeListings = activeListings;

    return res.status(200).json(
        new ApiResponse(
            200,
            { user: userObj, listings, reviews },
            "Public profile fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT REVIEW
// Buyer can review a seller after an order is completed
// One review per order — enforced by unique index on Review model
// ─────────────────────────────────────────────────────────────────────────────
const submitReview = asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
        throw new ApiError(400, "Order ID and rating are required");
    }

    // Fetch the order and verify it belongs to this buyer
    const order = await Order.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Only the buyer of this specific order can review it
    if (order.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only review orders you have purchased");
    }

    // Only completed orders can be reviewed — prevents reviewing before receiving item
    if (order.status !== "completed") {
        throw new ApiError(400, "You can only review completed orders");
    }

    // Create review — unique index on (reviewer, order) prevents duplicate reviews
    const review = await Review.create({
        reviewer: req.user._id,
        seller: order.seller,
        order: orderId,
        rating: parseInt(rating),
        comment: comment?.trim() || "",
    });

    // ── Update seller's average rating ─────────────────────────────────────
    // Recalculate from all reviews rather than just using the new one
    // This is accurate and handles edge cases (e.g. deleted reviews in future)
    const ratingStats = await Review.aggregate([
        { $match: { seller: order.seller } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 },
            },
        },
    ]);

    if (ratingStats.length > 0) {
        await User.findByIdAndUpdate(order.seller, {
            averageRating: Math.round(ratingStats[0].avgRating * 10) / 10, // Round to 1 decimal
            totalRatings: ratingStats[0].totalRatings,
        });
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { review }, "Review submitted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET REVIEWS FOR A SELLER
// Public — anyone can view a seller's reviews
// ─────────────────────────────────────────────────────────────────────────────
const getSellerReviews = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const seller = await User.findOne({ username }).select("_id");
    if (!seller) {
        throw new ApiError(404, "Seller not found");
    }

    const [reviews, total] = await Promise.all([
        Review.find({ seller: seller._id })
            .populate("reviewer", "username fullname avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Review.countDocuments({ seller: seller._id }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                reviews,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Reviews fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE ACCOUNT (Soft Delete)
// Sets isDeleted:true — never hard-delete because orders reference this user's _id
// Also soft-deletes all their active listings
// ─────────────────────────────────────────────────────────────────────────────
const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Please confirm your password to delete the account");
    }

    const user = await User.findById(req.user._id).select("+password");

    // Require password confirmation — prevents accidental or malicious deletion
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password");
    }

    // Soft delete the user and all their listings in parallel
    await Promise.all([
        User.findByIdAndUpdate(req.user._id, { isDeleted: true }),
        Product.updateMany(
            { seller: req.user._id, isSold: false },
            { isDeleted: true }
        ),
    ]);

    // Clear cookies
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export {
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
};