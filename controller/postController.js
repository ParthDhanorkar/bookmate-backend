const postModal = require("../model/postModal");
const userModel = require("../model/userModel");
const cloudinary = require("cloudinary").v2;


// Adding new Post
// Adding new Post
const createPostController = async (req, res) => {
    try {
      const { text } = req.body;
  
      // Validate text
      if (!text || text.trim().length === 0) {
        return res.status(400).send({
          success: false,
          message: "Post text is required",
        });
      }
  
      // Validate files
      if (!req.files || req.files.length === 0) {
        return res.status(400).send({
          success: false,
          message: "At least one image is required",
        });
      }
  
      if (req.files.length > 5) {
        return res.status(400).send({
          success: false,
          message: "You can upload a maximum of 5 images per post.",
        });
      }
  
      const userId = req.user.id;
  
      // Image data from multer-storage-cloudinary
      const images = req.files.map(file => ({
        url: file.path,         // already secure Cloudinary URL
        public_id: file.filename, // Cloudinary public_id
      }));
      // increse post Count 
      const user=await userModel.findById({_id:userId});
      let count=user.totalPosts;
      count=count+1;
      user.totalPosts=count;
      user.save();
      // Create new post
      const newPost = new postModal({
        text,
        images,
        createdBy: userId,
      });
  
      await newPost.save();
  
      res.status(201).send({
        success: true,
        message: "Post created successfully",
        post: newPost,
      });
    

  
    } catch (error) {
      console.error("Create Post Error:", error.stack);

      res.status(500).send({
        success: false,
        message: "Error in Create Post Controller",
        error: error.message
      });
    }
  };
  
  

// Get All Posts 

// GET /api/posts/all
const getAllPostsController = async (req, res) => {
  try {
    // Fetch all posts, sorted by latest first
    const posts = await postModal.find({})
      .populate("createdBy", "userName profile") // only return specific fields from user
      .sort({ createdAt: -1 });

    // If no posts found
    if (!posts || posts.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No posts found",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "All posts fetched successfully",
      totalPosts: posts.length,
      posts,
    });

  } catch (error) {
    console.error("Get All Posts Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Get All Posts Controller",
    });
  }
};

// Get Post By user Id
const getUserPostsController = async (req, res) => {
  try {
    const  userId  = req.params.id;

    // Validate userId
    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "Please Provide User ID",
      });
    }

    // User exist or not
    const  isMatch=await userModel.findById({_id:userId});
    if(!isMatch){
        return res.status(400).send({
            success: false,
            message: "Invalid User or User Not Found",
          });
    }

    // Find posts by the user
    const userPosts = await postModal.find({ createdBy: userId })
      .populate("createdBy", "userName profile")
      .populate("comments.user", "userName")
      .sort({ createdAt: -1 });

    if (!userPosts || userPosts.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No posts found for this user",
        postLength:userPosts.length
      });
    }

    res.status(200).send({
      success: true,
      message: "User posts fetched successfully",
      totalPosts: userPosts.length,
      posts: userPosts,
    });

  } catch (error) {
    console.error("Get User Posts Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Get Post By Id Controller",
    });
  }
};



// Like or unlike post
const likeUnlikePostController = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id; // from auth middleware

    // Validation: postId
    if (!postId) {
      return res.status(400).send({
        success: false,
        message: "Post ID is required",
      });
    }

    // Check if post exists
    const post = await postModal.findById(postId);
    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    // Toggle like/unlike
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).send({
      success: true,
      message: alreadyLiked ? "Post unliked successfully" : "Post liked successfully",
      totalLikes: post.likes.length,
    });

  } catch (error) {
    console.error("Like/Unlike Post Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Like Unlike Controller",
    });
  }
};


// Add Comment on post
const addCommentController = async (req, res) => {
  try {
    const postId  = req.params.postId;
    const { text } = req.body;
    const userId = req.user.id; // from auth middleware

    // ✅ Validate inputs
    if (!text || text.trim() === "") {
      return res.status(400).send({
        success: false,
        message: "Comment text is required",
      });
    }

    if (!postId) {
      return res.status(400).send({
        success: false,
        message: "Post ID is required",
      });
    }

    // ✅ Check if post exists
    const post = await postModal.findById(postId);
    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ Check if user exists (optional but good)
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return res.status(400).send({
        success: false,
        message: "Invalid user",
      });
    }

    // ✅ Create new comment object
    const newComment = {
      user: userId,
      text: text.trim(),
      timestamp: Date.now(),
    };

    // ✅ Add comment to the post
    post.comments.push(newComment);
    await post.save();

    res.status(200).send({
      success: true,
      message: "Comment added successfully",
      post,
    });

  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Add Comment Controller",
    });
  }
};


// Delete Comment
const deleteCommentController = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id; // from auth middleware

    // ✅ Validate required parameters
    if (!postId || !commentId) {
      return res.status(400).send({
        success: false,
        message: "Post ID and Comment ID are required",
      });
    }

    // ✅ Find the post
    const post = await postModal.findById(postId);
    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ Find the comment inside the post
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).send({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ Only comment owner or post owner can delete the comment
    const isPostOwner = post.createdBy.toString() === userId.toString();
    const isCommentOwner = comment.user.toString() === userId.toString();

    if (!isPostOwner && !isCommentOwner) {
      return res.status(403).send({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // ✅ Remove the comment
    comment.deleteOne();
    await post.save();

    res.status(200).send({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Comment Controller",
    });
  }
};

// Deleting Post 
const deletePostController = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id; // from auth middleware
  
      // Validate postId
      if (!postId) {
        return res.status(400).send({
          success: false,
          message: "Post ID is required",
        });
      }
  
      // Find the post
      const post = await postModal.findById(postId);
      if (!post) {
        return res.status(404).send({
          success: false,
          message: "Post not found",
        });
      }
  
      // Check if the current user is the owner
      if (post.createdBy.toString() !== userId.toString()) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to delete this post",
        });
      }
  
      // Delete each image from Cloudinary
      for (const image of post.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
      // decrease post count
      const user=await userModel.findById({_id:userId});
      let count=user.totalPosts;
      if(count>0){
        count=count-1;
        user.totalPosts=count;
        user.save();
      }
     
  
      // Delete the post from database
      await post.deleteOne();
  
      res.status(200).send({
        success: true,
        message: "Post deleted successfully along with its images",
      });
    } catch (error) {
      console.error("Delete Post Error:", error);
      res.status(500).send({
        success: false,
        message: "Error in Delete Post Controller",
      });
    }
  };


  // Update Post (we can delete image , add new images , add new text)

  const updatePostController = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
  
      // Parse body safely for multipart/form-data
      const text = req.body?.text;
      const imagesToDeleteRaw = req.body?.imagesToDelete;
  
      // Parse stringified JSON if provided
      const imagesToDelete = imagesToDeleteRaw ? JSON.parse(imagesToDeleteRaw) : [];
  
      // Validate postId
      if (!postId) {
        return res.status(400).send({
          success: false,
          message: "Post ID is required",
        });
      }
  
      // Find post
      const post = await postModal.findById(postId);
      if (!post) {
        return res.status(404).send({
          success: false,
          message: "Post not found",
        });
      }
  
      // Authorization
      if (post.createdBy.toString() !== userId.toString()) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to update this post",
        });
      }
  
      // Update text if present
      if (text && text.trim().length > 0) {
        post.text = text;
      }
  
      // Delete selected images
      if (imagesToDelete.length > 0) {
        for (const public_id of imagesToDelete) {
          await cloudinary.uploader.destroy(public_id);
          post.images = post.images.filter(img => img.public_id !== public_id);
        }
      }
      
  
      // Add new images
      if (req.files && req.files.length > 0) {
        const totalImages = post.images.length + req.files.length;
        if (totalImages > 5) {
          return res.status(400).send({
            success: false,
            message: "Total images after update must not exceed 5",
          });
        }
  
        const newImages = req.files.map(file => ({
          url: file.path,
          public_id: file.filename,
        }));
        post.images.push(...newImages);
      }
  
      await post.save();
  
      res.status(200).send({
        success: true,
        message: "Post updated successfully",
        post,
      });
  
    } catch (error) {
      console.error("Update Post Error:", error);
      res.status(500).send({
        success: false,
        message: "Error in Update Post Controller",
      });
    }
  };
  
  
  
  


module.exports = {
  createPostController,
  getAllPostsController,
  getUserPostsController,
  likeUnlikePostController,
  addCommentController,
  deleteCommentController,
  deletePostController,
  updatePostController
};
