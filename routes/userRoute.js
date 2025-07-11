const express=require('express');
const {  getuserController, updateUserController, resetPasswordController, updatePasswordController, deleteUserController, getUserByIdUserController, searchUserController, getAllUsersController } = require('../controller/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router=express.Router();
const upload = require('../middlewares/multerProfile');

// Get User
router.get('/getUser',authMiddleware,getuserController)

// Get User By ID
router.get('/getUserById/:id',authMiddleware,getUserByIdUserController)

// Update User (UseName, Address, Phone ,profile, bio,interest)
router.put('/updateUser',authMiddleware,upload.single("profile"),updateUserController)

//Update Password
router.post('/updatePassword',authMiddleware,updatePasswordController)

//Reset password using email or username and answer
router.post('/resetPassword',resetPasswordController)

//Delete User
router.delete('/deleteUser/:id',authMiddleware,deleteUserController)

//Search User By name ,Intrest, area
router.get('/search',authMiddleware,searchUserController)

// to get all users for discovey and home 
router.get('/all', authMiddleware, getAllUsersController);





module.exports=router;
