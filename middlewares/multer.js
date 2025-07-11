const multer = require("multer");
const { storage } = require("../utils/cloudinary");

// Create multer middleware using cloudinary storage
const upload = multer({storage});

module.exports = upload;
