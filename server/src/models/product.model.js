import mongoose, { Schema } from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MODEL
// Represents a listing on the campus marketplace.
// A product can be listed for sale or rent.
// Soft-deleted products are hidden from all queries by the pre-find hook.
// ─────────────────────────────────────────────────────────────────────────────
const productSchema = new Schema(
    {
        // ── Core Info ─────────────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: ["books", "electronics", "furniture", "clothing", "stationery", "sports", "other"],
            lowercase: true,
        },
        condition: {
            type: String,
            enum: ["new", "like-new", "good", "fair", "poor"],
            default: "good",
        },

        // ── Images ────────────────────────────────────────────────────────────
        // images[] → public Cloudinary URLs shown to users
        // imagePublicIds[] → internal Cloudinary IDs used to delete images
        // Both arrays stay in sync — same index refers to same image
        images: {
            type: [String],
            default: [],
            validate: [(arr) => arr.length <= 5, "Maximum 5 images allowed"],
        },
        imagePublicIds: {
            type: [String],
            default: [],
            select: false,  // Never expose Cloudinary internal IDs to frontend
        },

        // ── Seller 
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ── Listing Type 
        // "sell" → one-time purchase
        // "rent" → borrowable for a period, priced per day
        listingType: {
            type: String,
            enum: ["sell", "rent"],
            default: "sell",
        },
        rentalPricePerDay: {
            type: Number,
            default: null,  // Only relevant when listingType === "rent"
            min: [0, "Rental price cannot be negative"],
        },

        // ── Status ────────────────────────────────────────────────────────────
        isSold: {
            type: Boolean,
            default: false,
            index: true,
        },
        soldAt: {
            type: Date,
            default: null,
        },

        // ── AI Fields ─────────────────────────────────────────────────────────
        // Tracks whether AI generated the description and what price it suggested
        isAIDescriptionGenerated: {
            type: Boolean,
            default: false,
        },
        aiSuggestedPrice: {
            type: Number,
            default: null,
        },

        // ── Soft Delete ───────────────────────────────────────────────────────
        // Never hard-delete — orders reference product._id
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ seller: 1, isSold: 1 });          // My listings queries
productSchema.index({ category: 1, isSold: 1 });        // Browse by category
productSchema.index({ listingType: 1, isSold: 1 });     // Browse rentals
productSchema.index({ title: "text", description: "text" }); // Full-text search

// ── Pre-find Hook: always exclude soft-deleted products ───────────────────────
// This runs on find, findOne, findById, findOneAndUpdate etc.
// Means you NEVER have to remember to add { isDeleted: false } in queries
productSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next;
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);