const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const CLIENT_FILE = path.join(__dirname, '..', 'data', 'clientTransactions.json');

const defaultClientData = {
  clients: {
    '1': [
      {
        id: 101,
        gigTitle: "Logo Design",
        sellerName: "Raj Kumar",
        amount: 150,
        status: "completed",
        category: "design",
        createdAt: new Date('2024-12-01'),
        deliveryDate: new Date('2024-12-05'),
        rating: 5,
        review: "Excellent work, very professional!"
      },
      {
        id: 102,
        gigTitle: "Website Code Review",
        sellerName: "Priya Singh",
        amount: 75,
        status: "in_escrow",
        category: "coding",
        createdAt: new Date('2024-12-05'),
        deliveryDate: new Date('2024-12-08'),
        rating: 0,
        review: ""
      }
    ]
  }
};

let clientDB = loadJson(CLIENT_FILE, defaultClientData);

const persist = () => saveJson(CLIENT_FILE, clientDB);

// Get client transactions
router.get('/transactions', (req, res) => {
  const clientId = req.headers.authorization?.split(' ')[1] || '1';
  const transactions = clientDB.clients[clientId] || clientDB.clients['1'] || [];
  
  res.json(transactions);
});

// Search gigs (already in gigs.js, but can add here)
router.get('/search', (req, res) => {
  const { q, category, maxPrice } = req.query;
  // Return filtered gigs
  res.json([]);
});

// Initiate transaction
router.post('/hire', (req, res) => {
  const { gigId, amount } = req.body;

  if (!gigId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transaction = {
    id: Date.now(),
    gigId,
    amount,
    status: 'pending_payment',
    createdAt: new Date()
  };

  const clientId = req.headers.authorization?.split(' ')[1] || '1';
  if (!clientDB.clients[clientId]) {
    clientDB.clients[clientId] = [];
  }
  clientDB.clients[clientId].push(transaction);
  persist();

  res.status(201).json({ 
    message: "Transaction initiated. Please deposit funds.",
    transaction 
  });
});

module.exports = router;
