const mongoose=require('mongoose');

const friendSchema=new mongoose.Schema({

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"Sender Is Required"],
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"Receiver Is Required"],
    },
    friendStatus:{
        type:String,
        enum:["pending", "accepted", "rejected"],
        default:"pending",

    }
},{timestamps:true})

module.exports=mongoose.model('Friend',friendSchema);