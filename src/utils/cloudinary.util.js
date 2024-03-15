import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with API credentials
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided.");
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // Remove the locally saved temporary file (asynchronously)
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error("Error in deleting file:", err);
            }
        });
        // Return the Cloudinary response
        return response;
    } catch (error) {
        console.error("Upload failed:", error.message);
        // Remove the locally saved temporary file if it exists
        if (fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) {
                    console.error("Error in deleting file:", err);
                }
            });
        }
        // Return null if there's an error
        return null;
    }
}

// Function to remove a file from Cloudinary
const removeFromCloudinary = async (ExistingFileUrl) => {
    try {
        if (!ExistingFileUrl) throw new Error("No existing URL is found.");
        // Destroy the file from Cloudinary
        const response = await cloudinary.uploader.destroy(ExistingFileUrl);
        // Return the Cloudinary response
        return response;
    } catch (error) {
        console.error("Removal failed:", error.message);
        return null;
    }
}

// Export the uploadOnCloudinary & removeFromCloudinary function
export { uploadOnCloudinary, removeFromCloudinary };
