const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Data layout in messages.json:
// {
//   conversations: { '<convId>': [ { id, sender, receiver, text, timestamp, read } ] },
//   users: { '<userId>': [ '<convId>', ... ] }
// }

let messagesDB = loadJson(MESSAGES_FILE, { conversations: {}, users: {} });

const persist = () => saveJson(MESSAGES_FILE, messagesDB);

// conversation id is deterministic and order-independent
const getConversationId = (a, b) => [a, b].sort().join('_');

// Read users file for names. Expect users.json to map userId/email -> { name, role, ... }
const getUserInfo = (userId) => {
  const users = loadJson(USERS_FILE, {});
  if (users && users[userId]) {
    console.log(`✅ Got user info for ${userId}:`, users[userId].name);
    return users[userId];
  }
  console.log(`⚠️ No user info found for ${userId}, using email fallback`);
  return { name: userId.split('@')[0], email: userId, role: 'user' };
};

// List conversations for a user
router.get('/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const convIds = messagesDB.users[userId] || [];

  const list = convIds.map(id => {
    const msgs = messagesDB.conversations[id] || [];
    const parts = id.split('_');
    const other = parts.find(p => p !== userId) || parts[0];
    const otherInfo = getUserInfo(other);
    const lastMessage = msgs.length ? msgs[msgs.length - 1] : null;
    const unread = msgs.filter(m => !m.read && m.receiver === userId).length;

    return {
      conversationId: id,
      otherUserId: other,
      otherUserName: otherInfo.name,
      otherUserRole: otherInfo.role,
      lastMessage,
      unreadCount: unread,
      messageCount: msgs.length
    };
  });

  // sort by lastMessage timestamp desc
  list.sort((a, b) => {
    const ta = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
    const tb = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
    return tb - ta;
  });

  res.json(list);
});

// Get messages for a conversation
router.get('/conversation/:userId/:otherUserId', (req, res) => {
  const { userId, otherUserId } = req.params;
  const convId = getConversationId(userId, otherUserId);
  const msgs = messagesDB.conversations[convId] || [];

  // Return messages ordered ascending (oldest first)
  msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(msgs);
});

// Send a message
router.post('/send', (req, res) => {
  const { sender, receiver, text } = req.body || {};
  if (!sender || !receiver || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const convId = getConversationId(sender, receiver);

  if (!messagesDB.conversations[convId]) messagesDB.conversations[convId] = [];
  if (!messagesDB.users[sender]) messagesDB.users[sender] = [];
  if (!messagesDB.users[receiver]) messagesDB.users[receiver] = [];

  if (!messagesDB.users[sender].includes(convId)) messagesDB.users[sender].push(convId);
  if (!messagesDB.users[receiver].includes(convId)) messagesDB.users[receiver].push(convId);

  const message = {
    id: Date.now(),
    sender,
    receiver,
    text,
    timestamp: new Date().toISOString(),
    read: false
  };

  messagesDB.conversations[convId].push(message);
  persist();

  res.status(201).json({ message: 'Message sent', data: message });
});

// Mark conversation messages as read for a user
router.post('/mark-read', (req, res) => {
  const { userId, otherUserId } = req.body || {};
  if (!userId || !otherUserId) return res.status(400).json({ error: 'Missing fields' });

  const convId = getConversationId(userId, otherUserId);
  const msgs = messagesDB.conversations[convId] || [];
  let changed = false;
  msgs.forEach(m => {
    if (m.receiver === userId && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) persist();
  res.json({ message: 'Marked as read' });
});

// Return user info (prefer stored name)
router.get('/user-info/:userId', (req, res) => {
  const { userId } = req.params;
  const info = getUserInfo(userId);
  res.json(info);
});

// Debug endpoint to see current users.json content
router.get('/debug/users-json', (req, res) => {
  const users = loadJson(USERS_FILE, {});
  res.json({ message: 'Current users.json content', data: users });
});

module.exports = router;