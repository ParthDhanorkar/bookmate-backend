const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "User Name Is Required"],
      unique:true,
      minlength: 3,
       maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, "Password Is Required"],
    },
    address: [
      {
        type: { type: String }, // e.g., "home", "office"
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String
      }
    ],
    phone: {
      type: String,
      required: [true, "Phone Number Is Required"],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],

    },
    // userType: {
    //   type: String,
    //   require: [true, "User Type Is Required"],
    //   default: "client",
    //   enum: ["client", "admin", "vendour", "driver"],
    // },

    profile: [
      {
        url: { type: String }, // Cloudinary url
        public_id: { type: String }, // public id used to delete image
      },
    ],
    // profile2: {
    //   type: String,
    //   default:
    //     "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-260nw-2220431045.jpg",
    // },
    answer:{
        type:String,
        required:[true,"Answer is Required"]
    },
    dob:{
      type:Date,
      required:[true,"Date Of Birth Is Required"]
    },
    bio:{
      type:String,
      required:true,
    },
    interests:{
      type:Array,
      required:true,
      minlength:1
    },
    gender:{
        type:String,
        required:[true,"Gender is Required"],
        enum:["Male","Female","Other"]
    },
    friends:[
     {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
     }
    ],
    friendsRejected:[
      {
       type:mongoose.Schema.Types.ObjectId,
       ref:'User'
      }
     ],
     totalPosts:{
      type:Number,
      default:0,
     }
  },
  { timestamps: true }
);

// export
module.exports = mongoose.model("User", userSchema);
