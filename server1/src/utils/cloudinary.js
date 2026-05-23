import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, // Use the ENV variable here
  api_secret: process.env.CLOUDINARY_API_SECRET // Use the ENV variable here
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // CRITICAL FIX: Added 'await' here
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Delete the local file now that it's on Cloudinary
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
                
        return response; // This will now be the actual data object
            
    } catch (err) {
        // Clean up the local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary }