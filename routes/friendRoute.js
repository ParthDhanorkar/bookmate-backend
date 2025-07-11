const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { addFriendRequestFriendController, acceptFriendRequestFriendController, rejectFriendRequestFriendController, getAllFriendsController, pendingRequestFriendController, cancelFriendRequestController, unfriendFriendController, requestSendedByYou, removeRejectedRequestController, rejectedRequestFriendController } = require('../controller/friendController');

const router=express.Router();

//Send Friend Requiest
router.post('/sendRequest/:request',authMiddleware,addFriendRequestFriendController);

//Accept Friend Request
router.post('/acceptRequest/:FriendID',authMiddleware,acceptFriendRequestFriendController)

// Reject Friend request
router.post('/rejectrequest/:FriendID',authMiddleware,rejectFriendRequestFriendController)

// Get All friends of user
router.get('/getAllFriends',authMiddleware,getAllFriendsController)

// Get All Pending Requests
router.get('/pendingRequest',authMiddleware,pendingRequestFriendController)

// Cancel Friend Request before it gets accepted or after rejected also 
router.delete('/cancelRequest/:request',authMiddleware,cancelFriendRequestController)

// Request Sended By you
router.get('/sendedRequests',authMiddleware,requestSendedByYou)
// Unfriend User
router.delete('/unFriend/:request',authMiddleware,unfriendFriendController)

// request rejected by user 
router.get('/rejectedRequests', authMiddleware, rejectedRequestFriendController);


// remove rejected friend request 
router.delete('/removeRejectedRequest/:id', authMiddleware, removeRejectedRequestController);


module.exports=router




// request:- this is the receivers _id

// FriendID :- this is the _id of the friend schema