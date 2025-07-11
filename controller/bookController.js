const bookModule = require("../model/bookModule");
const userModel = require("../model/userModel");

const addBookController=async(req,res)=>{
    try {
        // getting user id
        const userId=req.user.id;
        if(!userId){
            return res.status(404).send({
                success:false,
                message:"User not Authenticated"
            })
        }
        const checkUser=await userModel.findById(userId);
        if(!checkUser){
            if(!checkUser){
                return res.status(404).send({
                    success:false,
                    message:"User NOt Found"
                })
            }
        }
        
        // deconstruct
        const {title,author,genre,description,readingStatus,coverImage}=req.body;
        if(!title || !author || !genre || !description ){
            return res.status(500).send({
                success:false,
                message:"All Feilds are Required"
            })
        }
        // Making title to normalised form
        const titleNormalised=title.trim().toLowerCase();
        // checking book is available already in database
        const isMatch=await bookModule.findOne({titleNormalised});
        if(isMatch){
            return res.status(500).send({
                success:false,
                message:"Book Already Exist in Shelf",
            })
        }
        // Adding Book in database
        const newBook=await bookModule.create({title,titleNormalised,author,genre,description,readingStatus,coverImage,addedBy:userId});
        // Adding book to user profile (will add here in future);
        return res.status(200).send({
            success:true,
            message:"Book Added Successfully",
            newBook
        })

    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Add Book Controller",
            error:error.message
        })
    }
}

// To update Book 
const updateBookController=async(req,res)=>{
    try {
           // getting user id
        const userId=req.user.id;
        if(!userId){
            return res.status(404).send({
                success:false,
                message:"User not Authenticated"
            })
        }
        const checkUser=await userModel.findById(userId);
        if(!checkUser){
            if(!checkUser){
                return res.status(404).send({
                    success:false,
                    message:"User NOt Found"
                })
            }
        }
        const bookId=req.params.id;
        if(!bookId){
            return res.status(404).send({
                success:false,
                message:"Book Id is Required"
            })
        }
         // Check if book is Available in database
         const isMatch=await bookModule.findById(bookId);
         if(!isMatch){
            return res.status(404).send({
                success:false,
                message:"Book Not found",
            })
         }
        // Checking only right user can update
        if (isMatch.addedBy.toString() !== userId) {
            return res.status(403).send({
                success: false,
                message: "You are not authorized to update this book",
            });
        }
       
        // deconstruct
        const {title,author,genre,description,readingStatus,coverImage}=req.body;
        if (title) {
          // making it to Noramalised form
            const titleNormalised = title.trim().toLowerCase();
            // finding for existing book with new comming title
            const existingBook = await bookModule.findOne({ titleNormalised });
            if (existingBook && existingBook._id.toString() !== bookId) {
                return res.status(400).send({
                    success: false,
                    message: "Another book with this title already exists",
                });
            }
            isMatch.title = title;
            isMatch.titleNormalised = titleNormalised;
        }
        if(author) isMatch.author=author;
        if(genre) isMatch.genre=genre;
        if(description) isMatch.description=description;
        if(readingStatus) isMatch.readingStatus=readingStatus;
        if(coverImage) isMatch.coverImage=coverImage;
        
            // Adding Book in database
            await isMatch.save();
          // Adding book to user profile (will add here in future);
          return res.status(200).send({
            success:true,
            message:"Book Updated Successfully",
            isMatch
        })

        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Update Book Controller",
            error:error.message
        })
    }
}

const deleteBookController=async(req,res)=>{
    try {
         // getting user id
         const userId=req.user.id;
         if(!userId){
             return res.status(404).send({
                 success:false,
                 message:"User not Authenticated"
             })
         }
         const checkUser=await userModel.findById(userId);
         if(!checkUser){
             if(!checkUser){
                 return res.status(404).send({
                     success:false,
                     message:"User NOt Found"
                 })
             }
         }

         const bookId=req.params.id;
         if(!bookId){
             return res.status(404).send({
                 success:false,
                 message:"Book Id is Required"
             })
         }

          // Check if book is Available in database
          const isMatch=await bookModule.findById(bookId);
          if(!isMatch){
             return res.status(404).send({
                 success:false,
                 message:"Book Not found",
             })
          }
         // Ensure only the user who added the book can delete it
         if (isMatch.addedBy.toString() !== userId) {
             return res.status(403).send({
                 success: false,
                 message: "You are not authorized to update this book",
             });
         }


          await bookModule.deleteOne({_id:bookId});
          return res.status(200).send({
            success:true,
            message:"Book Deleted Successfully",
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in Delete Book Controller",
            error:error.message
        })
    }
}

// To get all Books Available in Books model

const getAllBooksController = async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};
  
      if (search) {
        const regex = new RegExp(search.trim(), "i");
  
        query.$or = [
          { titleNormalised: regex },
          { author: regex },
          { genre: regex }
        ];
      }
  
      const books = await bookModule
        .find(query)
        .populate("addedBy", "username profile interests gender bio")
        .sort({ createdAt: -1 });
  
      return res.status(200).send({
        success: true,
        message: "Books fetched successfully",
        books,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in Get All Books Controller",
        error: error.message,
      });
    }
  };


  // Get Book by id 
  const getBookByIdController = async (req, res) => {
    try {
      const bookId = req.params.id;
  
      const book = await bookModule
        .findById(bookId)
        .populate("addedBy", "username profile interests gender bio");
  
      if (!book) {
        return res.status(404).send({
          success: false,
          message: "Book not found",
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Book fetched successfully",
        book,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in Get Book By Id Controller",
        error: error.message,
      });
    }
  };
  

  const getUserBooksController = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const books = await bookModule
        .find({ addedBy: userId })
        .sort({ createdAt: -1 });
  
      return res.status(200).send({
        success: true,
        message: "User's books fetched successfully",
        books,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "Error in Get Users Book Controller",
        error: error.message,
      });
    }
  };
  

  

module.exports={addBookController,updateBookController,
    deleteBookController,getAllBooksController,getBookByIdController,getUserBooksController}