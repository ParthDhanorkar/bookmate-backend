const userModel = require("../model/userModel");
const bcrypt=require('bcryptjs')
const JWT=require('jsonwebtoken')
const cloudinary = require('../utils/cloudinaryProfile');
const streamifier = require('streamifier');



const registerController = async (req, res) => {
    try {
        const { userName, email, password, phone, answer, dob, bio, interests, address, gender } = req.body;

        // Validations
        if (!userName || !email || !password || !dob || !phone || !answer || !bio || !interests || !address || !gender) {
            return res.status(500).send({
                success: false,
                message: "Please Provide All Fields",
            });
        }

        if (!req.file) {
            return res.status(400).send({
                success: false,
                message: "Profile image is required",
            });
        }

        // Check existing user/email
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(500).send({
                success: false,
                message: "Email Already Registered Please Login",
            });
        }

        const existingUserName = await userModel.findOne({ userName });
        if (existingUserName) {
            return res.status(500).send({
                success: false,
                message: "Username Already In Use",
            });
        }

        // Encrypt Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Manual Cloudinary Upload after all validations
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

        // Create user
        const newUser = await userModel.create({
            userName,
            email,
            password: hashedPassword,
            dob,
            phone,
            answer,
            bio,
            interests: JSON.parse(interests),
            address: JSON.parse(address),
            gender,
            profile: { url: result.secure_url, public_id: result.public_id },
        });

        const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Remove sensitive info
        const userObj = newUser.toObject();
        delete userObj.password;
        delete userObj.phone;
        delete userObj.answer;

        res.status(201).send({
            success: true,
            message: "User Registered Successfully",
            user: userObj,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Register Controller",
            error: error.message,
        });
    }
};





const loginController=async(req,res)=>{
    try {
        const {email,password,userName}=req.body;
        // Validation // can login using email or user name
        if((!email && !userName) || !password){
            return res.status(500).send({
                success:false,
                message:"Please Provide All Fields",
            })
        }
        // checking user exist or not
        let user;
        if(email){
            user=await userModel.findOne({email})
        }
        else{
             user = await userModel.findOne({userName});
        }
       
        if(!user){
            return res.status(500).send({
                success:false,
                message:"User Not Exist , Please Register",
            })
        }
        // check for correct possword
        const isMatch=await bcrypt.compare(password,user.password); 
        if(!isMatch){
            return res.status(500).send({
                success:false,
                message:"Incorrect Credintials",
            })
        }

        user.password=undefined;
        //JWT Tocken
        const token=await JWT.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        //Successful login
        return res.status(201).send({
            success:true,
            message:"Login Successful",
            token,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in Login Controller",
            error,
        })
    }
}

module.exports={registerController,loginController};