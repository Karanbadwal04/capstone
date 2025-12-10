const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Load messages (keyed by conversation ID like "user1_user2")
let messagesDB = loadJson(MESSAGES_FILE, {
  conversations: {},
  users: {}
});

const persist = () => saveJson(MESSAGES_FILE, messagesDB);

// Generate conversation ID (sorted to ensure consistency)
const getConversationId = (user1, user2) => {
  return [user1, user2].sort().join('_');
};

// Get user info by email
const getUserInfo = (email) => {
  const usersDB = loadJson(USERS_FILE, {});
  return usersDB[email] || { name: email.split('@')[0], email, role: 'unknown' };
};

// Get conversations for a user
router.get('/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const userConvos = messagesDB.users[userId] || [];
  
  const conversations = userConvos.map(convId => {
    const messages = messagesDB.conversations[convId] || [];
    const participants = convId.split('_');
    const otherUser = participants.find(p => p !== userId);
    const otherUserInfo = getUserInfo(otherUser);
    
    return {
      conversationId: convId,
      otherUser,
      otherUserName: otherUserInfo.name,
      otherUserRole: otherUserInfo.role,
      lastMessage: messages[messages.length - 1] || null,
      messageCount: messages.length,
      unreadCount: messages.filter(m => !m.read && m.sender !== userId).length
    };
  });
  
  res.json(conversations);
});

// Get messages in a conversation
router.get('/conversation/:userId/:otherUserId', (req, res) => {
  const { userId, otherUserId } = req.params;
  const convId = getConversationId(userId, otherUserId);
  
  const messages = messagesDB.conversations[convId] || [];
  res.json(messages);
});

// Send a message
router.post('/send', (req, res) => {
  const { sender, receiver, text } = req.body;
  
  if (!sender || !receiver || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const convId = getConversationId(sender, receiver);
  
  // Initialize conversation if new
  if (!messagesDB.conversations[convId]) {
    messagesDB.conversations[convId] = [];
  }
  
  // Add to users' conversation lists
  if (!messagesDB.users[sender]) messagesDB.users[sender] = [];
  if (!messagesDB.users[receiver]) messagesDB.users[receiver] = [];
  
  if (!messagesDB.users[sender].includes(convId)) {
    messagesDB.users[sender].push(convId);
  }
  if (!messagesDB.users[receiver].includes(convId)) {
    messagesDB.users[receiver].push(convId);
  }
  
  const message = {
    id: Date.now(),
    sender,
    receiver,
    text,
    timestamp: new Date(),
    read: false
  };
  
  messagesDB.conversations[convId].push(message);
  persist();
  
  res.status(201).json({ message: 'Message sent', data: message });
});

// Mark messages as read
router.post('/mark-read', (req, res) => {
  const { userId, otherUserId } = req.body;
  const convId = getConversationId(userId, otherUserId);
  
  if (messagesDB.conversations[convId]) {
    messagesDB.conversations[convId].forEach(msg => {
      if (msg.receiver === userId) {
        msg.read = true;
      }
    });
    persist();
  }
  
  res.json({ message: 'Messages marked as read' });
});

// Get user info by email
router.get('/user-info/:email', (req, res) => {
  const { email } = req.params;
  const userInfo = getUserInfo(email);
  res.json(userInfo);
});

module.exports = router;
