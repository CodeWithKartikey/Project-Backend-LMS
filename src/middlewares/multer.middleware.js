import multer from "multer";

// Define storage settings for multer
const storage = multer.diskStorage({
    // Specify the destination directory for uploaded files
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    // Define how the file should be named
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Define file filter function to restrict file types
const fileFilter = (req, file, cb) => {
    // Accept only files with certain MIME types
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type.'), false); // Reject the file
    }
};

// Configure multer with storage, file filter, and file size limit (5MB)
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // 5MB file size limit
    }
});

// Export the upload function
export { upload };
