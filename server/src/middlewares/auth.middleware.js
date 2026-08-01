import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


// verifyJWT Middleware
// Attaches the authenticated user to req.user so controllers can access it
// Checks the cookie first (web clients), then the Authorization header (mobile/API)

const verifyJWT = asyncHandler(async (req, _, next) => {
    // Try cookie first, fall back to "Bearer <token>" header for API/mobile clients
    const token =
        req.cookies?.accessToken ||
        req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Access token is required. Please login.");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Invalid or expired access token. Please login again.");
    }

    // Fetch the user from DB — confirms the account still exists
    // We don't need sensitive fields here, just identity
    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "User not found. Please login again.");
    }
    // console.log("user is verified")
    // Attach user to request object — all downstream controllers can use req.user
    req.user = user;
    next();
});

export { verifyJWT };