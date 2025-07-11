const { token } = require("morgan");
const userModel = require("../model/userModel");
const bcrypt=require('bcryptjs');
const cloudinary = require('../utils/cloudinaryProfile');
const streamifier = require('streamifier');

// Get User data 
const getuserController=async(req,res)=>{
     try {
        //find user
        const user=await userModel.findById({_id:req.user.id});

        //Validations
        if(!user){
            return res.status(404).send({
                success:false,
                message:"User Not Found"
            })
        }
        //Hide Password phone and answer
        Object.assign(user,{
            password:undefined,
            phone:undefined,
            answer:undefined
        })
       

        //Response
        res.status(200).send({
            success:true,
            message:"User Data Get Successfully",
            user
        })
        
     } catch (error) {
       res.status(500).send({
        success:false,
        message:"Error in Get User Controller",
        error
       })
     }
}

// Get User By id

const getUserByIdUserController=async(req,res)=>{
    try {
        // Finding User By id
        const user= await userModel.findById({_id:req.params.id});
        if(!user){
            res.status(404).send({
                success:false,
                message:"User Not Found"
            })
        }
        // hiding users password , phone, answer from sharing
        Object.assign(user,{
            password:undefined,
            phone:undefined,
            answer:undefined
        })
        // return success and data
        res.status(200).send({
            success:true,
            message:"User Data Get Successfully",
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:true,
            Message:"Error in Get User By Id User Controller"
        })
        
    }
}


// Update User data
const updateUserController = async (req, res) => {
    try {
        // Find user 
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User Not Found",
            });
        }

        // Destructure fields from req.body
        const { userName, address, phone, bio, interests } = req.body;

        // Update text fields if provided
        if (userName) user.userName = userName;
        if (address) user.address = JSON.parse(address);
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;
        if (interests) user.interests = JSON.parse(interests);

        // ✅ Profile image handling via Cloudinary (if file is present)
        if (req.file) {
            // Upload new profile image to Cloudinary
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'bookmate-profiles' },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload(req);

            // Optional: delete old image from Cloudinary (if required)
            if (user.profile && user.profile.public_id) {
                await cloudinary.uploader.destroy(user.profile.public_id);
            }

            // Save new profile image data
            user.profile = {
                url: result.secure_url,
                public_id: result.public_id,
            };
        }

        // Save updated user
        await user.save();

        res.status(200).send({
            success: true,
            message: "User Data Updated Successfully",
            user, // optionally send updated user
        });

    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).send({
            success: false,
            message: "Error in Update User Controller",
            error: error.message,
        });
    }
};


// Update password
const updatePasswordController=async(req,res)=>{
    try {
       const user=await userModel.findById(req.user.id);
       if(!user){
        return res.status(404).send({
            success:false,
            message:"User Not Found"
        })
       }
       const {oldePassword,newPassword}=req.body;
        if(!oldePassword || !newPassword){
            return res.status(500).send({
                success:false,
                message:"Please Provide All Fields"
            })
        }
        // check old Password is right
        const isMatch=await bcrypt.compare(oldePassword,user.password);
        if(!isMatch){
            return res.status(404).send({
                success:false,
                message:"Incorrect Password"
            })
        }
        // Hash new Password
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword=await bcrypt.hash(newPassword,salt);
        // save new Password
        user.password=hashedPassword;
        await user.save();
        res.status(200).send({
            success:true,
            message:"Password Updated Succesfully",
            
        })

    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Update Password Controller",
            error
           })
    }
}


//Reset Password
const resetPasswordController=async(req,res)=>{
    try {
        const {email,newPassword,answer,userName}=req.body;
        //Validations
        if((!email && !userName) || !newPassword || !answer){
            return res.status(500).send({
                success:false,
                message:"Please Provide All Fields"
            })
        }
        //finding user using email
        let user;
        if(email){
             user=await userModel.findOne({email,answer});
        }
        else{
            user=await userModel.findOne({userName,answer});
        }
        
        if(!user){
            return res.status(500).send({
                success:false,
                message:"Incorrect Credintials"
            })
        }
        // hashingh password
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword=await bcrypt.hash(newPassword,salt);
        user.password=hashedPassword;
         await user.save();
         res.status(200).send({
            success:true,
            message:"Password Reset Succesfully",
            
        })
        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Reset Password Controller",
            error
           })
    }
}

// Delete User Profile 

const deleteUserController=async(req,res)=>{
    try {
        await userModel.findByIdAndDelete(req.params.id);
        // console.log(token);
       return res.status(200).send({
            success:true,
            message:"Your Account has been Deleted",
            
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Delete User Controller",
            error
           })
    }
}

// searching user using UserName , Address , interests
const searchUserController=async(req,res)=>{
    try {
        const {query:searchText}=req.query;
        if(!searchText){
            return res.status(400).send({
                success:false,
                message:"Please Enter Something To Search"
            })
        }
        const users = await userModel.find({
            $or: [
              { userName: { $regex: searchText, $options: "i" } },          // match username
              { "address.city": { $regex: searchText, $options: "i" } },    // match city
              { "address.street": { $regex: searchText, $options: "i" } },  // match street
              { interests: { $elemMatch: { $regex: searchText, $options: "i" } } }, // match interests
            ]
          }).select("-password -phone -answer"); // remove sensitive info
      
          // Send matched users
          res.status(200).send({
            success: true,
            message: "Users found successfully",
            users,
          });
        
        
        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Search User Controller",
            error
           })
    }
}


// getting all users for home and discovey page 


const getAllUsersController = async (req, res) => {
  try {
    // Exclude the logged-in user
    const users = await userModel.find({ _id: { $ne: req.user.id } })
      .select('-password -phone -answer -createdAt -updatedAt -__v'); // Remove sensitive fields

    res.status(200).json({
      success: true,
      message: 'Fetched all users successfully',
      user:users,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

module.exports = { getAllUsersController };

module.exports={getuserController,updateUserController,resetPasswordController,
    updatePasswordController,deleteUserController,getUserByIdUserController,searchUserController,getAllUsersController};