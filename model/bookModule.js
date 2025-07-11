const mongoose=require('mongoose');


const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, "Book Title is Required"],
    },
    titleNormalised:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },

    author: {
      type: String,
      required: [true, "Book Author is Required"],
    },
    genre: [{
      type: String,
      required: [true, "Book Genre is Required"]
    }],
    description: {
      type: String,
      required: [true, "Book Description is Required"]
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Book Adder is Required"],
    },
    readingStatus: {
      type: String,
      enum: ["reading", "want to read", "read"],
      default: "want to read"
    },
    coverImage: {
      type: String,
      default: "https://img.favpng.com/16/4/1/logo-book-clip-art-png-favpng-LgHG5HHuHKfW92by2m5Azg0hQ.jpg"
    }
  }, {
    timestamps: true
  });


module.exports=mongoose.model('Book',bookSchema);