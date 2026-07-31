import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
    {
        // Identity 
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [20, "Username cannot exceed 20 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        fullname: {
            type: String,
            trim: true,
            default: "",
            maxlength: [50, "Full name cannot exceed 50 characters"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        //  Profile 
        avatar: {
            type: String,       // Cloudinary URL
            default: "",
        },
        avatarPublicId: {
            // Cloudinary public_id — needed to DELETE the old image when user uploads a new one
            // Without this we'd accumulate dead images on Cloudinary forever
            type: String,
            default: "",
            select: false,      // Internal field — never expose to frontend
        },
        phone: {
            type: String,
            default: null,
            match: [/^[0-9]{10}$/, "Phone must be a valid 10-digit number"],
        },
        college: {
            type: String,
            default: "",
            trim: true,
        },
        bio: {
            type: String,
            default: "",
            maxlength: [200, "Bio cannot exceed 200 characters"],
        },

        // ── Role
        role: {
            type: String,
            enum: ["buyer", "seller", "admin"],
            default: "buyer",
        },

        // ── Ratings (updated whenever a new review is submitted) ──────────────
        // We store pre-computed values so public profiles load fast without aggregation
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },

        // ── Notification Preferences 
        notificationPreferences: {
            emailOnNewOrder: { type: Boolean, default: true },
            emailOnOrderUpdate: { type: Boolean, default: true },
        },

        // ── Soft Delete 
        // Never hard-delete users — orders reference their _id
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },

        // ── Email Verification 
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationOTP: { type: String, select: false },
        emailVerificationOTPExpiry: { type: Date, select: false },

        // ── Password Reset 
        passwordResetOTP: { type: String, select: false },
        passwordResetOTPExpiry: { type: Date, select: false },

        // ── Auth ──────────────────────────────────────────────────────────────
        refreshToken: { type: String, select: false },
    },
    { timestamps: true }
);

// ── Pre-save: hash password only when it changes ──────────────────────────────
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ── Methods ───────────────────────────────────────────────────────────────────
UserSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, username: this.username, role: this.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
    );
};

export const User = mongoose.model("User", UserSchema);