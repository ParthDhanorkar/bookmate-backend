const multer = require('multer');

const storage = multer.memoryStorage(); // no auto-upload to Cloudinary
const upload = multer({ storage });

module.exports = upload;