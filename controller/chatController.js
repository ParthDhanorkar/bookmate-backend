const Chat = require('../model/Chat');
const Message = require('../model/Message');


// get all messages for a chat
const getAllMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Find the chat first
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if logged-in user is part of this chat
    const userId = req.user.id; // or req.user.id based on your auth middleware
    const isMember = chat.members.includes(userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these messages'
      });
    }

    // Get messages sorted by oldest first
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('getAllMessages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load messages'
    });
  }
};


// find or create chat between logged-in user and another user
const getOrCreateChat = async (req, res) => {
    try {
      const userId = req.user.id; // logged-in user
      const { friendId } = req.params;
  
      // find chat with both users as members
      let chat = await Chat.findOne({ members: { $all: [userId, friendId] } });
      if (!chat) {
        chat = await Chat.create({ members: [userId, friendId] });
      }
  
      res.status(200).json({
        success: true,
        chatId: chat._id,
      });
    } catch (error) {
      console.error('getOrCreateChat error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get or create chat',
      });
    }
  };
  
  module.exports = { getOrCreateChat, getAllMessages };
  

