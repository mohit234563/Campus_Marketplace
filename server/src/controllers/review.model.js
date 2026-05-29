import mongoose, { Schema } from "mongoose";


// A review is written by a buyer about a seller after an order is completed.
// One review per order — enforced by the unique compound index below.

const reviewSchema = new Schema(
    {
        reviewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,     // The buyer who writes the review
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,     // The seller being reviewed
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,     // Which completed order this review is for
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [300, "Review comment cannot exceed 300 characters"],
            default: "",
        },
    },
    { timestamps: true }
);

// ── Indexes
// Unique constraint: one review per order — prevents buyers from reviewing twice
reviewSchema.index({ reviewer: 1, order: 1 }, { unique: true });
// Fast lookup of all reviews for a seller (used on public profile)
reviewSchema.index({ seller: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);