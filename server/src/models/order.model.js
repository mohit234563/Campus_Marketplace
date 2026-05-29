import mongoose, { Schema } from "mongoose";


// ORDER MODEL
// Represents a buy/rent agreement between two campus users.
// No payment is processed — this is purely a coordination record.
//
// Status flow:
//   pending → confirmed → completed
//   pending → cancelled  (buyer withdraws)
//   pending → cancelled  (seller rejects)
//   confirmed → cancelled (either party, before completion)

const orderSchema = new Schema(
    {
        // ── Parties
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // ── Financials 
        // totalAmount is the agreed price at time of request
        // Stored separately in case seller edits product price later
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Amount cannot be negative"],
        },

        // ── Type 
        orderType: {
            type: String,
            enum: ["purchase", "rental"],
            default: "purchase",
        },

        // ── Status 
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
            index: true,
        },

        // ── Buyer's message when placing the request 
        // e.g. "Can we meet tomorrow near the library?"
        buyerNote: {
            type: String,
            maxlength: [200, "Note cannot exceed 200 characters"],
            default: "",
        },

        // ── Meetup details (filled by seller when accepting) 
        meetupLocation: {
            type: String,
            maxlength: [200, "Location cannot exceed 200 characters"],
            default: "",
        },
        meetupTime: {
            type: Date,
            default: null,
        },

        // ── Cancellation 
        cancelledBy: {
            type: String,
            enum: ["buyer", "seller", null],
            default: null,
        },
        cancelReason: {
            type: String,
            maxlength: [300, "Reason cannot exceed 300 characters"],
            default: "",
        },
        cancelledAt: {
            type: Date,
            default: null,
        },

        // ── Completion 
        completedAt: {
            type: Date,
            default: null,  // Set when seller marks the order as completed
        },

        // ── Rental Dates (only for orderType === "rental") 
        rentalStartDate: {
            type: Date,
            default: null,
        },
        rentalEndDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// ── Indexes 
orderSchema.index({ buyer: 1, createdAt: -1 });     // Buyer's order history
orderSchema.index({ seller: 1, createdAt: -1 });    // Seller's order history
orderSchema.index({ product: 1, status: 1 });       // Check pending requests on a product

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);