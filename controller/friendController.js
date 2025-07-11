const friendModel = require("../model/friendModel");
const userModel = require("../model/userModel");
// Add Friend Request
const addFriendRequestFriendController=async(req,res)=>{
    try {
        const sender=req.user.id;
        const receiver=req.params.request;
        
        
        // Validations 
        if(!sender || !receiver){
             return res.status(500).send({
                success:false,
                message:"Sender and receiver are required"
             }) 
        }
        // checking that sender and reciever should not same
        if(sender===receiver){
            return res.status(500).send({
                success:false,
                message:"Sender and receiver cannot be the same user"
            })
        }
        // checking that does request already exist
        const exist1=await friendModel.findOne({receiver:sender,sender:receiver});
        if(exist1){
            return res.status(500).send({
                success:false,
                message:"Friend request recived(Check Pending Requests) "
            }) 
        }
        const exist2=await friendModel.findOne({sender:sender,receiver:receiver});
        if(exist2){
            return res.status(500).send({
                success:false,
                message:"Friend request already sent"
            }) 
        }
          // sending request
        const newRequest=await friendModel.create({sender,receiver});
        await newRequest.save();
         return res.status(200).send({
            success:true,
            message:"Friend request sent successfully",
            newRequest
         })

        
    } catch (error) {
        console.log(error),
        res.status(500).send({
            success:false,
            message:"Error in Add Friend Request Controller"
        })
    }
}

// Accept friend Request
const acceptFriendRequestFriendController = async (req, res) => {
    try {
      const requestId = req.params.FriendID;
      const userId = req.user.id;
  
      // Validate requestId
      if (!requestId) {
        return res.status(400).send({
          success: false,
          message: "Please provide FriendID",
        });
      }
  
      // Find friend request
      const friendRequest = await friendModel.findById(requestId);
      if (!friendRequest) {
        return res.status(404).send({
          success: false,
          message: "Friend request not found",
        });
      }
  
      // Check if the current user is the receiver
      if (friendRequest.receiver.toString() !== userId) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to accept this request",
        });
      }
  
      // Check if already accepted
      if (friendRequest.friendStatus === "accepted") {
        return res.status(400).send({
          success: false,
          message: "Friend request already accepted",
        });
      }
  
      // Accept request
      friendRequest.friendStatus = "accepted";
      await friendRequest.save();

     // saving id of sender to reciever (adding id in friend)
      await userModel.findByIdAndUpdate({_id:userId},{ $push: { friends: friendRequest.sender } },{new: true});
      //// saving id of reciever to sender (adding id in friend)
      await userModel.findByIdAndUpdate({_id:friendRequest.sender},{ $push: { friends: userId } },{new: true});
  
      res.status(200).send({
        success: true,
        message: "Friend request accepted successfully",
        friendRequest,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in Accept Friend Request Controller",
        error,
      });
    }
  };

  // reject friend request
  const rejectFriendRequestFriendController=async(req,res)=>{
    try {
        const requestId = req.params.FriendID;
      const userId = req.user.id;
  
      // Validate requestId
      if (!requestId) {
        return res.status(400).send({
          success: false,
          message: "Please provide FriendID",
        });
      }
  
      // Find friend request
      const friendRequest = await friendModel.findById(requestId);
      if (!friendRequest) {
        return res.status(404).send({
          success: false,
          message: "Friend request not found",
        });
      }
  
      // Check if the current user is the receiver
      if (friendRequest.receiver.toString() !== userId) {
        return res.status(403).send({
          success: false,
          message: "You are not authorized to Reject this request",
        });
      }
  
      // Check if already accepted
      if (friendRequest.friendStatus === "rejected") {
        return res.status(400).send({
          success: false,
          message: "Friend request already Rejected",
        });
      }
  
      // Accept request
      friendRequest.friendStatus = "rejected";
      await friendRequest.save();

     // saving id of sender to reciever (adding id in friend)
      await userModel.findByIdAndUpdate({_id:userId},{ $push: { friendsRejected: friendRequest.sender } },{new: true});
      
      
  
      res.status(200).send({
        success: true,
        message: "Friend request Rejected successfully",
        friendRequest,
      });
    } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: "Error in Reject Friend Request Controller",
          error,
        });
    }
  }
  // Getting all users
  
  const getAllFriendsController = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id).populate("friends", "-password -phone -answer");
      // Validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
       // Findinge the friends are available or not
      if (!user.friends || user.friends.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No friends found",
          friends: [],
        });
      }
     // success
      res.status(200).send({
        success: true,
        message: "Friends fetched successfully",
        friends: user.friends,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in Get All Friends Controller",
        error,
      });
    }
  };

  // Finding all pending request
  const pendingRequestFriendController = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
      // Validations
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
  
      const pendingRequests = await friendModel.find({ receiver: user._id, friendStatus: "pending" }).populate("sender", "userName profile address bio interests"); // we can add more fields
      // checking the length of the array
      if (pendingRequests.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No pending requests",
          friends: [],
        });
      }
      // returning success
      res.status(200).send({
        success: true,
        message: "Pending requests fetched successfully",
        friends: pendingRequests,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in Pending Request Friends Controller",
        error,
      });
    }
  };
  

  // Cancelling friend request before it gets accepted
  const cancelFriendRequestController = async (req, res) => {
    try {
      const senderId = req.user.id;
      const  receiverId  = req.params.request;
      // Validations
      if (!receiverId) {
        return res.status(400).send({
          success: false,
          message: "Receiver ID is required",
        });
      }
  
      // Find the pending friend request
      const request = await friendModel.findOne({
        sender: senderId,
        receiver: receiverId,
        $or: [
          { friendStatus: "rejected" },
          { friendStatus: "pending" }
        ] ,
      });
  
      if (!request) {
        return res.status(404).send({
          success: false,
          message: "No pending friend request found to cancel",
        });
      }
  
      // Delete the request
      await friendModel.findByIdAndDelete(request._id);
  
      res.status(200).send({
        success: true,
        message: "Friend request cancelled successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in cancelling friend request Controller",
        error,
      });
    }
  };


  // Unfriend 

  const unfriendFriendController = async (req, res) => {
    try {
      const userId = req.user.id; // Logged-in user
      const  friendId  = req.params.request; // ID of friend to unfriend
  
      if (!friendId) {
        return res.status(400).send({
          success: false,
          message: "Friend ID is required",
        });
      }
  
      // Find the friend relationship in either direction
      const friendship = await friendModel.findOne({
        $or: [
          { sender: userId, receiver: friendId, friendStatus: "accepted" },
          { sender: friendId, receiver: userId, friendStatus: "accepted" },
        ],
      });
  
      if (!friendship) {
        return res.status(404).send({
          success: false,
          message: "Friendship not found",
        });
      }
  
      // Delete the friendship
      await friendModel.findByIdAndDelete(friendship._id);
  
      // Remove from both users' friend lists
      await userModel.findByIdAndUpdate(userId, {
        $pull: { friends: friendId },
      },{new:true});
  
      await userModel.findByIdAndUpdate(friendId, {
        $pull: { friends: userId },
      },{new:true});
  
      res.status(200).send({
        success: true,
        message: "Unfriended successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in unfriending user Controller",
        error,
      });
    }
  };

// Request sended by you 
  const requestSendedByYou = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
      // Validations
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
  
      const pendingRequests = await friendModel.find({ 
        sender: user._id, 
        $or: [
          { friendStatus: "rejected" },
          { friendStatus: "pending" }
        ]
      }).populate("receiver", "userName profile address bio interests");      if (pendingRequests.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Pending Request You Have Send",
          friends: [],
        });
      }
      // returning success
      res.status(200).send({
        success: true,
        message: "Pending requests fetched successfully",
        friends: pendingRequests,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in Pending Request Friends Controller",
        error,
      });
    }
  };


   // Request rejected 
   const rejectedRequestFriendController = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
      // Validation
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "User not found",
        });
      }
  
      // Find rejected friend requests where the receiver is the logged-in user
      const rejectedRequests = await friendModel.find({
        receiver: user._id,
        friendStatus: "rejected",
      }).populate("sender", "userName profile address bio interests");
  
      if (rejectedRequests.length === 0) {
        return res.status(200).send({
          success: true,
          message: "No Rejected Requests",
          friends: [],
        });
      }
  
      res.status(200).send({
        success: true,
        message: "Rejected requests fetched successfully",
        friends: rejectedRequests,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in rejected Request Friends Controller",
        error,
      });
    }
  };

  // remove rejected request 
  const removeRejectedRequestController = async (req, res) => {
    try {
      const userId = req.user.id;
      const friendRequestId = req.params.id;
  
      // Find the friend request to ensure it exists and is rejected
      const friendRequest = await friendModel.findById(friendRequestId);
  
      if (!friendRequest) {
        return res.status(404).send({
          success: false,
          message: "Friend request not found",
        });
      }
  
      if (friendRequest.friendStatus !== "rejected") {
        return res.status(400).send({
          success: false,
          message: "This request is not in rejected state",
        });
      }
  
      // Remove this sender's ID from user's friendsRejected array
      await userModel.findByIdAndUpdate(userId, {
        $pull: { friendsRejected: friendRequest.sender }
      }, { new: true });
  
      // Remove the friend request from Friend collection
      await friendModel.findByIdAndDelete(friendRequestId);
  
      res.status(200).send({
        success: true,
        message: "Rejected request removed successfully",
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: "Error in removing rejected request",
        error,
      });
    }
  };
  
  

module.exports={addFriendRequestFriendController,acceptFriendRequestFriendController,
    rejectFriendRequestFriendController,getAllFriendsController,pendingRequestFriendController,cancelFriendRequestController,unfriendFriendController,requestSendedByYou,rejectedRequestFriendController,removeRejectedRequestController}