const bookShelfModel = require('../model/bookShelfModel');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Add Book
const addBookToShelfController = async (req, res) => {
    try {
      const { title, author, genre, description, readingStatus, personalNote, progress, goal } = req.body;
  
      if (!title || !author) {
        return res.status(400).send({ success: false, message: 'Title and Author are required' });
      }
  
      if (!req.file) {
        return res.status(400).send({ success: false, message: 'Book cover image is required' });
      }
  
      // Manual Cloudinary Upload
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'bookmate-bookshelf' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      const result = await streamUpload(req);
  
      const newBook = await bookShelfModel.create({
        user: req.user.id,
        title,
        author,
        genre,
        description,
        readingStatus,
        coverImage: { url: result.secure_url, public_id: result.public_id },
        personalNote,
        progress,
        goal,
      });
  
      res.status(201).send({ success: true, message: 'Book added to shelf', book: newBook });
  
    } catch (error) {
      console.error('Add Book Error:', error);
      res.status(500).send({ success: false, message: 'Error adding book', error: error.message });
    }
  };
  
  
// Get User's Book Shelf
const getUserBookShelfController = async (req, res) => {
  try {
    const books = await bookShelfModel.find({ user: req.user.id });
    res.status(200).send({ success: true, books });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error fetching shelf', error: error.message });
  }
};

// Update Book in Shelf
const updateBookInShelfController = async (req, res) => {
    try {
      const book = await bookShelfModel.findById(req.params.id);
      if (!book) return res.status(404).send({ success: false, message: 'Book not found' });
  
      if (book.user.toString() !== req.user.id) {
        return res.status(403).send({ success: false, message: 'Unauthorized' });
      }
  
      const { title, author, genre, description, readingStatus, personalNote, progress, goal } = req.body;
  
      // Safe update check
      if (title !== undefined) book.title = title;
      if (author !== undefined) book.author = author;
      if (genre !== undefined) book.genre = genre;
      if (description !== undefined) book.description = description;
      if (readingStatus !== undefined) book.readingStatus = readingStatus;
      if (personalNote !== undefined) book.personalNote = personalNote;
      if (progress !== undefined) book.progress = progress;
      if (goal !== undefined) book.goal = goal;
  
      // Cover image replacement
      if (req.file) {
        if (book.coverImage?.public_id) {
          await cloudinary.uploader.destroy(book.coverImage.public_id);
        }
  
        const streamUpload = (req) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'bookmate-bookshelf' },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
        };
  
        const result = await streamUpload(req);
        book.coverImage = { url: result.secure_url, public_id: result.public_id };
      }
  
      await book.save();
      res.status(200).send({ success: true, message: 'Book updated', book });
  
    } catch (error) {
      console.error('Update Book Error:', error);
      res.status(500).send({ success: false, message: 'Error updating book', error: error.message });
    }
  };
  
  
// Delete Book from Shelf
const deleteBookFromShelfController = async (req, res) => {
  try {
    const book = await bookShelfModel.findById(req.params.id);
    if (!book) return res.status(404).send({ success: false, message: 'Book not found' });

    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    }

    await book.deleteOne();
    res.status(200).send({ success: true, message: 'Book deleted' });

  } catch (error) {
    res.status(500).send({ success: false, message: 'Error deleting book', error: error.message });
  }
};

// Get Currently Reading Book
const getCurrentReadingBookController = async (req, res) => {
    try {
      const book = await bookShelfModel.findOne({
        user: req.user.id,
        readingStatus: 'Reading',
      }).sort({ updatedAt: -1 });
  
      if (!book) return res.status(200).send({ success: true, book: null });
  
      res.status(200).send({ success: true, book });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Error fetching book', error: error.message });
    }
  };

  // Get Recent Notes
  const getRecentNotesController = async (req, res) => {
    try {
      const notes = await bookShelfModel.find({
        user: req.user.id,
        personalNote: { $exists: true, $ne: '' },
      })
      .select('title personalNote')
      .limit(3)
      .sort({ updatedAt: -1 });
  
      res.status(200).send({ success: true, notes });
    } catch (error) {
      res.status(500).send({ success: false, message: 'Error fetching notes', error: error.message });
    }
  };

module.exports = {
  addBookToShelfController,
  getUserBookShelfController,
  updateBookInShelfController,
  deleteBookFromShelfController,
  getCurrentReadingBookController,
  getRecentNotesController
};
