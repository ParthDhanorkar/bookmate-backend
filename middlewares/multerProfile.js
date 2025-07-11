// const multer = require("multer");
// const { storage } = require("../utils/cloudinaryProfile");

// // Create multer middleware using cloudinary storage
// const upload = multer({storage});

// module.exports = upload;




const multer = require('multer');

const storage = multer.memoryStorage(); // no auto-upload to Cloudinary
const upload = multer({ storage });

module.exports = upload;

