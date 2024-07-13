const multer = require('multer');

// Define storage
const storage = multer.memoryStorage();

// Define file filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

// Configure multer to accept any number of files with any field names
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;