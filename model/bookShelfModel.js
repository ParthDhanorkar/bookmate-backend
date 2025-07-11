const mongoose = require('mongoose');

const bookShelfSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  description: { type: String },
  readingStatus: {
    type: String,
    enum: ['Not Started', 'Reading', 'Completed', 'Want to Read'],
    default: 'Not Started',
  },
  coverImage: {
    url: { type: String },
    public_id: { type: String },
  },
  personalNote: { type: String }, // For private user note
  progress: { type: Number, default: 0 }, // percentage: 0 to 100
  goal: { type: Number, default: 0 }, // total pages or chapters as goal
}, { timestamps: true });

module.exports = mongoose.model('BookShelf', bookShelfSchema);
