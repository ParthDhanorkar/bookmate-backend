const express=require('express');
const { registerController, loginController } = require('../controller/authController');
const upload = require('../middlewares/multerProfile');
const router=express.Router();

// REGISTER || POST
router.post('/register',upload.single("profile"),registerController);

//LOGIN || POST
router.post('/login',loginController)

module.exports=router;