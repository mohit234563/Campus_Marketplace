import multer from "multer";
import path from "path";


// DISK STORAGE
// Multer saves the uploaded file to /tmp/uploads/ on the server disk first.
// Then our cloudinary util picks it up, uploads it, and deletes the temp file.
// We use disk storage (not memory storage) to avoid loading large files into RAM.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Make sure this folder exists (created in index.js)
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname + timestamp + original extension
        // e.g. "avatar-1716823456789.jpg"
        const uniqueSuffix = Date.now();
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// FILE FILTER
// Only allow image files — reject PDFs, executables, etc.

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);     // Accept the file
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

// MULTER INSTANCE
// 5MB limit per file — reasonable for product/avatar images

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB in bytes
});