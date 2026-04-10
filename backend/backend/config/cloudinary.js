import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// Cloudinary Configuration     
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage (Temporary local storage before uploading to cloud)
const storage = multer.diskStorage({});
const upload = multer({ storage });

export { cloudinary, upload };