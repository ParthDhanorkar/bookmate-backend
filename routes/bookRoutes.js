const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { addBookController, updateBookController, deleteBookController, getAllBooksController, getBookByIdController, getUserBooksController } = require('../controller/bookController');


const router=express.Router();

//Adding Book To database
router.post('/addBook',authMiddleware,addBookController)

// Updarte Book 
router.put('/updateBook/:id',authMiddleware,updateBookController)

// Delete book by id
router.delete('/deleteBook/:id',authMiddleware,deleteBookController)

//Get All Books Available in Book Model(it will search for book title , gener ,author also)
//In postmen search for (getAllBook?search=harry).
router.get('/getAllBook',getAllBooksController)

// Get Book by id 
router.get('/getBookByID/:id',getBookByIdController)

// Get users all books controller
router.get('/getUserBook',authMiddleware,getUserBooksController)



module.exports=router;



