import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// CLOUDINARY CONFIG
// Reads credentials from .env — configure these:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// uploadOnCloudinary
// Takes a local file path (written by Multer), uploads it to Cloudinary,
// then deletes the local temp file whether upload succeeds or fails.
// Returns the full Cloudinary response (we use .url and .public_id)

const uploadOnCloudinary = async (localFilePath, folder = "campus_marketplace") => {
    if (!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",  // Handles images, videos, etc.
            folder,                 // Organizes files in Cloudinary dashboard
        });

        // Delete the temp file from disk after successful upload
        fs.unlinkSync(localFilePath);
        return response;           // Contains .url, .public_id, .width, .height etc.
    } catch (err) {
        // Delete temp file even if upload failed — don't leave orphaned files on disk
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw err;                 // Re-throw so the controller can handle it
    }
};


// deleteFromCloudinary
// Deletes an image by its public_id — called when user changes their avatar
// or deletes a product image. Prevents dead files accumulating on Cloudinary.

const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;  // { result: 'ok' } on success
    } catch (err) {
        // Log but don't crash the app if Cloudinary delete fails
        // The user's action (e.g. uploading new avatar) should still succeed
        console.error("Cloudinary delete failed:", err.message);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };