const express = require('express');
const router = express.Router();
const { loadJson, saveJson, ensureDir } = require('../utils/fileStore');
const path = require('path');

// Path to gigs data file
const gigsFilePath = path.join(__dirname, '../data/gigs.json');

// Ensure directory exists
ensureDir(gigsFilePath);

// Initialize gigs data file if it doesn't exist
let gigs = loadJson(gigsFilePath, null);
if (!gigs) {
  gigs = [
    {
      id: 1,
      title: "I will review your thesis for ₹1500",
      description: "Professional thesis review with detailed feedback",
      price: 1500,
      category: "writing",
      deliveryDays: 3,
      seller: { id: 1, name: "Raj Kumar", verified: true },
      rating: 4.8,
      createdAt: new Date()
    }
  ];
  try {
    saveJson(gigsFilePath, gigs);
  } catch (err) {
    console.error('Failed to initialize gigs file:', err);
  }
}

// Save gigs to file
const saveGigs = () => {
  try {
    saveJson(gigsFilePath, gigs);
  } catch (err) {
    console.error('Failed to save gigs file:', err);
  }
};

// Get all gigs
router.get('/all', (req, res) => {
  res.json(gigs);
});

// Create gig
router.post('/create', (req, res) => {
  const { title, description, price, category, deliveryDays } = req.body;
  
  if (!title || !description || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const gig = {
    id: Date.now(),
    title,
    description,
    price: parseInt(price),
    category: category || "other",
    deliveryDays: parseInt(deliveryDays) || 1,
    seller: { id: 1, name: "Current User", verified: true },
    rating: 0,
    orders: 0,
    createdAt: new Date()
  };

  gigs.push(gig);
  saveGigs();
  res.status(201).json(gig);
});

// Get gig by ID
router.get('/:id', (req, res) => {
  const gig = gigs.find(g => g.id == req.params.id);
  if (!gig) {
    return res.status(404).json({ error: "Gig not found" });
  }
  res.json(gig);
});

// Update gig
router.put('/:id', (req, res) => {
  const gig = gigs.find(g => g.id == req.params.id);
  if (!gig) {
    return res.status(404).json({ error: "Gig not found" });
  }

  const { title, description, price, category, deliveryDays } = req.body;
  gig.title = title || gig.title;
  gig.description = description || gig.description;
  gig.price = price || gig.price;
  gig.category = category || gig.category;
  gig.deliveryDays = deliveryDays || gig.deliveryDays;

  saveGigs();
  res.json(gig);
});

// Delete gig
router.delete('/:id', (req, res) => {
  gigs = gigs.filter(g => g.id != req.params.id);
  saveGigs();
  res.json({ message: "Gig deleted" });
});

module.exports = router;
