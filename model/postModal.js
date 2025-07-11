const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true,"Text Is required"],
  },
  images: [
    {
      url: { type: String }, // Cloudinary url
      public_id: { type: String }, // public id used to delete image
    },
  ],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true,"user Is required"],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true,"user Is required"],
      },
      text: {
        type: String,
        required: [true,"Text Is required"],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      }
    }
  ]
  
},{timestamps:true});

module.exports = mongoose.model("Post", postSchema);
