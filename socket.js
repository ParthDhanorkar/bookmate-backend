const Chat = require('./model/Chat');
const Message = require('./model/Message');

let onlineUsers = {}; // userId -> socket.id

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // add user
    socket.on('addUser', (userId) => {
      onlineUsers[userId] = socket.id;
      console.log('🟢 Online users:', onlineUsers);
    });

    // send message
    socket.on('sendMessage', async ({ senderId, receiverId, text, replyTo }) => {
      try {
        let chat = await Chat.findOne({ members: { $all: [senderId, receiverId] } });
        if (!chat) chat = await Chat.create({ members: [senderId, receiverId] });

        const message = await Message.create({ chatId: chat._id, sender: senderId, text, replyTo });
        chat.lastMessage = text;
        chat.updatedAt = Date.now();
        await chat.save();

        const messageData = {
          _id: message._id,
          chatId: chat._id,
          sender: senderId,
          text,
          replyTo,
          createdAt: message.createdAt,
        };

        // send to receiver if online
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', messageData);

        // also send to sender
        socket.emit('receiveMessage', messageData);

      } catch (err) {
        console.error('sendMessage error:', err);
      }
    });

    // ✅ delete single message
    socket.on('deleteMessage', async ({ messageId, senderId }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) return;
          if (message.sender.toString() !== senderId) return; // fix: convert to string
      
          // find chat to get other member
          const chat = await Chat.findById(message.chatId);
          if (!chat) return;
          const receiverId = chat.members.find(id => id != senderId);
      
          await message.deleteOne();
      
          // notify sender
          socket.emit('messageDeleted', { messageId });
      
          // notify receiver if online
          const receiverSocketId = onlineUsers[receiverId];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', { messageId });
          }
      
        } catch (err) {
          console.error('deleteMessage error:', err);
        }
      });

    // ✅ delete all messages
    socket.on('deleteAllMessages', async ({ chatId, senderId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        if (!chat.members.includes(senderId)) return;

        const receiverId = chat.members.find(id => id != senderId);

        await Message.deleteMany({ chatId });

        // notify sender
        socket.emit('allMessagesDeleted', { chatId });

        // notify receiver if online
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('allMessagesDeleted', { chatId });
        }
      } catch (err) {
        console.error('deleteAllMessages error:', err);
      }
    });

    // disconnect
    socket.on('disconnect', () => {
      for (const [userId, id] of Object.entries(onlineUsers)) {
        if (id === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

module.exports = initSocket;
