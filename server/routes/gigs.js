const express = require('express');
const router = express.Router();

// Mock gigs database
let gigs = [
  {
    id: 1,
    title: "I will review your thesis for $20",
    description: "Professional thesis review with detailed feedback",
    price: 20,
    category: "writing",
    deliveryDays: 3,
    seller: { id: 1, name: "Raj Kumar", verified: true },
    rating: 4.8,
    createdAt: new Date()
  }
];

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

  res.json(gig);
});

// Delete gig
router.delete('/:id', (req, res) => {
  gigs = gigs.filter(g => g.id != req.params.id);
  res.json({ message: "Gig deleted" });
});

module.exports = router;
