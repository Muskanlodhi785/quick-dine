import { v2 as cloudinary } from "cloudinary";
/**
 * Configure the Cloudinary SDK once at server boot.
 * Prefers explicit env vars; falls back to CLOUDINARY_URL if set.
 */
export const initCloudinary = () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
        return true;
    }
    if (process.env.CLOUDINARY_URL) {
        cloudinary.config();
        return true;
    }
    console.warn("Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET or CLOUDINARY_URL). " +
        "Image uploads will be skipped; restaurant images will fall back to local placeholders.");
    return false;
};
/** True when Cloudinary credentials are configured. */
export const cloudinaryReady = () => Boolean(process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET));
