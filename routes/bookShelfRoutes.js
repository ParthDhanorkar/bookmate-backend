const express = require('express');
const { addBookToShelfController, getUserBookShelfController, updateBookInShelfController, deleteBookFromShelfController, getCurrentReadingBookController, getRecentNotesController } = require('../controller/bookShelfController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerShelf'); // Cloudinary Multer Setup

const router = express.Router();

// Add book to shelf
router.post('/add', authMiddleware, upload.single('coverImage'), addBookToShelfController);

// Get user's shelf books
router.get('/myShelf', authMiddleware, getUserBookShelfController);

// Update a book in shelf
router.put('/update/:id', authMiddleware, upload.single('coverImage'), updateBookInShelfController);

// Delete book from shelf
router.delete('/delete/:id', authMiddleware, deleteBookFromShelfController);

// current reading book
router.get('/currently-reading', authMiddleware, getCurrentReadingBookController);
// recently added note 
router.get('/recent-notes', authMiddleware, getRecentNotesController);

module.exports = router;
