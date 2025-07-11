const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');
const { createPostController, getAllPostsController, getUserPostsController, likeUnlikePostController, addCommentController, deleteCommentController, deletePostController, updatePostController } = require('../controller/postController');

const router=express.Router();

// Add Post;
router.post('/addPost',authMiddleware,upload.array("images",10),createPostController);

// Get All Posts 
router.get('/getAll',getAllPostsController);

// Get Post by specific user id
router.get('/getById/:id',authMiddleware,getUserPostsController);

// Like post or unlike : postId
router.put('/like/:postId',authMiddleware,likeUnlikePostController);

// Add Comment on Post
router.post('/addComment/:postId',authMiddleware,addCommentController);

// Delete Comment
router.delete('/deleteComment/:postId/:commentId',authMiddleware,deleteCommentController);

//Delete Post using postId
router.delete('/deletePost/:postId',authMiddleware,deletePostController);

// Update Post (delete images, add images , edit text)
router.put('/update/:postId',authMiddleware,upload.array("images",10),updatePostController)


module.exports=router;