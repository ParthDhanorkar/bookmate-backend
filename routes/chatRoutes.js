const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllMessages, getOrCreateChat } = require('../controller/chatController');

const router = express.Router();

// get or create chat between logged-in user and friendId
router.get('/with-user/:friendId', authMiddleware, getOrCreateChat);

// get messages by chatId
router.get('/:chatId', authMiddleware, getAllMessages);

module.exports = router;
