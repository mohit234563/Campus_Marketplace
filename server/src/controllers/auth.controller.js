import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import {
    sendVerificationOTP,
    sendWelcomeEmail,
    sendPasswordResetOTP,
} from "../services/email.service.js";
import jwt from "jsonwebtoken";
   

const cookieOptions = () => ({
    httpOnly: true,
    // sameSite:"none" is required for cookies to be set when frontend and
    // backend are on different domains (e.g. Vercel + Render) — this REQUIRES
    // secure:true, which in turn requires the site to be served over HTTPS.
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — matches refresh token expiry
});

// HELPER — Generate Access + Refresh Tokens
// Separated into its own function because loginUser and refreshAccessToken both need it.
// Saves the hashed refresh token on the user document so we can validate it later.
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
 
        if (!user) {
            throw new ApiError(404, "User not found for token generation");
        }
 
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
 
        // Persist the refresh token on the DB document so we can verify it on refresh
        // validateBeforeSave:false skips schema validation (we only changed one field)
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
 
        return { accessToken, refreshToken };
    }  catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("generateAccessAndRefreshTokens failed:", err); // ADD THIS LINE
    throw new ApiError(
        500,
        "Something went wrong while generating access and refresh tokens"
    );

}
};

// REGISTER
// Flow: validate → check duplicate → create user → send OTP email → respond
// We do NOT log the user in here. They must verify their email first.
const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;
 
    // Validate all required fields are present and not empty strings
    if ([username, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "Username, email, and password are required");
    }
 
    // Check if a user already exists with this username OR email
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }
 
    // Generate a 6-digit OTP and its 10-minute expiry timestamp
    const { otp, otpExpiry } = generateOTP();
 
    // Create the user — password is hashed automatically by the pre-save hook on the model
    const user = await User.create({
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
        fullname: fullname?.trim() || "",
        // Store OTP fields so we can verify them in verifyOTP controller
        emailVerificationOTP: otp,
        emailVerificationOTPExpiry: otpExpiry,
        isEmailVerified: false,
    });
 
    // Send the OTP to the user's email via Nodemailer
    await sendVerificationOTP({ to: email, name: fullname || username, otp });
 
    // Return only safe fields — never return password, refreshToken, or OTP fields
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationOTP -emailVerificationOTPExpiry"
    );
 
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
 
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: createdUser },
                "Registered successfully. Please check your email for the OTP to verify your account."
            )
        );
});
// VERIFY OTP
// Flow: find user → check OTP match → check expiry → mark verified → send welcome email
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
 
    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }
 
    // Explicitly select OTP fields since they have select:false on the schema
    const user = await User.findOne({ email }).select(
        "+emailVerificationOTP +emailVerificationOTPExpiry"
    );
 
    if (!user) {
        throw new ApiError(404, "No account found with this email");
    }
 
    if (user.isEmailVerified) {
        throw new ApiError(400, "This email is already verified. Please login.");
    }
 
    // Check the OTP matches what we stored
    if (user.emailVerificationOTP !== otp) {
        throw new ApiError(400, "Invalid OTP. Please check the code and try again.");
    }
 
    // Check the OTP hasn't expired (stored as a Date, compare with current time)
    if (user.emailVerificationOTPExpiry < new Date()) {
        throw new ApiError(
            400,
            "OTP has expired. Please request a new one via resend OTP."
        );
    }
 
    // Mark email as verified and clear the OTP fields so they can't be reused
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save({ validateBeforeSave: false });
 
    // Send a welcome email now that verification is complete
    await sendWelcomeEmail({ to: user.email, name: user.fullname || user.username });
 
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Email verified successfully. You can now login."));
});
 
// RESEND OTP
// Useful if the first email was lost or the 10-minute window expired

const resendVerificationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
 
    if (!email) throw new ApiError(400, "Email is required");
 
    const user = await User.findOne({ email });
 
    if (!user) throw new ApiError(404, "No account found with this email");
 
    if (user.isEmailVerified) {
        throw new ApiError(400, "This email is already verified.");
    }
 
    // Generate a fresh OTP with a new 10-minute window
    const { otp, otpExpiry } = generateOTP();
 
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });
 
    await sendVerificationOTP({
        to: user.email,
        name: user.fullname || user.username,
        otp,
    });
 
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "A new OTP has been sent to your email."));
});

// LOGIN
// Flow: find user → check email verified → verify password → issue tokens → set cookies

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
 
    // Accept either username or email — at least one must be provided
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }
 
    if (!password) {
        throw new ApiError(400, "Password is required");
    }
 
    // Find the user by username OR email using MongoDB $or operator
    const user = await User.findOne({ $or: [{ username }, { email }] }).select(
        "+password" // password has select:false so we must explicitly request it
    );
 
    if (!user) {
        throw new ApiError(404, "No account found. Please register first.");
    }
 
    // Block login if email is not verified — prevents unverified accounts from using the app
    if (!user.isEmailVerified) {
        throw new ApiError(
            403,
            "Please verify your email before logging in. Check your inbox for the OTP."
        );
    }
 
    // Compare the plain-text password against the bcrypt hash stored in DB
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }
 
    // Generate both tokens and save refreshToken to DB
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
 
    // Fetch clean user data to return — exclude sensitive fields
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationOTP -emailVerificationOTPExpiry"
    );
 
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions())
        .cookie("refreshToken", refreshToken, cookieOptions())
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    // Also send tokens in body so mobile clients (no cookie support) can store them
                    accessToken,
                    refreshToken,
                },
                "Logged in successfully"
            )
        );
});
 

// LOGOUT
// Clears the refresh token from DB and removes both cookies from the client
// req.user is set by verifyJWT middleware before this runs

const logoutUser = asyncHandler(async (req, res) => {
    // Remove refresh token from DB — invalidates the token server-side
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } }, // $unset removes the field entirely
        { new: true }
    );
 
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions())
        .clearCookie("refreshToken", cookieOptions())
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});
 

// REFRESH ACCESS TOKEN
// When the access token (15m) expires, the client sends the refresh token (7d)
// to get a new access token without requiring the user to log in again

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Check cookie first (web), then body (mobile apps)
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
 
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
 
    // Decode the token to get the user _id stored inside it
    let decodedToken;
    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token. Please login again.");
    }
 
    // Fetch the user and their stored refresh token from DB
    const user = await User.findById(decodedToken._id).select("+refreshToken");
 
    if (!user) {
        throw new ApiError(401, "User not found. Please login again.");
    }
 
    // Validate that the token sent matches what we stored — prevents token reuse after logout
    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token has been used or revoked. Please login again.");
    }
 
    // Issue a new access token (and rotate the refresh token for extra security)
    const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);
 
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions())
        .cookie("refreshToken", newRefreshToken, cookieOptions())
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

// FORGOT PASSWORD
// Generates a reset OTP and emails it — does NOT expose whether the email exists
// (to prevent email enumeration attacks)

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
 
    if (!email) throw new ApiError(400, "Email is required");
 
    const user = await User.findOne({ email });
 
    // Return success even if user doesn't exist — prevents email enumeration
    if (!user) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "If an account with this email exists, a reset OTP has been sent."
                )
            );
    }
 
    const { otp, otpExpiry } = generateOTP();
 
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });
 
    await sendPasswordResetOTP({
        to: user.email,
        name: user.fullname || user.username,
        otp,
    });
 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "If an account with this email exists, a reset OTP has been sent."
            )
        );
});
 

// RESET PASSWORD
// Flow: verify reset OTP → set new password → clear OTP → force re-login

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
 
    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }
 
    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }
 
    // Explicitly select reset OTP fields (select:false on schema)
    const user = await User.findOne({ email }).select(
        "+passwordResetOTP +passwordResetOTPExpiry +password"
    );
 
    if (!user) throw new ApiError(404, "No account found with this email");
 
    if (!user.passwordResetOTP) {
        throw new ApiError(400, "No password reset was requested for this account");
    }
 
    if (user.passwordResetOTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }
 
    if (user.passwordResetOTPExpiry < new Date()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }
 
    // Setting password triggers the pre-save bcrypt hook on the model automatically
    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    // Invalidate all existing sessions by clearing the refresh token
    user.refreshToken = undefined;
    await user.save();
 
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully. Please login with your new password."
            )
        );
});
 
export {
    registerUser,
    verifyOTP,
    resendVerificationOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword
};
 