const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const STUDENT_FILE = path.join(__dirname, '..', 'data', 'student.json');

const defaultData = {
  profiles: {
    '1': {
      userId: 1,
      name: 'Raj Kumar',
      email: 'raj@lpu.in',
      bio: 'Expert in web development and design',
      skills: ['JavaScript', 'React', 'Node.js', 'Figma'],
      rating: 4.8,
      verified: true,
      earnings: 1250,
      inEscrow: 450,
      portfolio: [],
      createdAt: new Date()
    }
  },
  earnings: {
    '1': {
      totalEarned: 1250,
      inEscrow: 450,
      available: 800,
      transactions: [
        {
          id: 101,
          title: "Logo Design",
          amount: 150,
          status: "completed",
          date: "2024-12-05"
        },
        {
          id: 102,
          title: "Website Review",
          amount: 75,
          status: "in_escrow",
          date: "2024-12-06"
        }
      ]
    }
  }
};

let studentDB = loadJson(STUDENT_FILE, defaultData);

const persist = () => saveJson(STUDENT_FILE, studentDB);

// Get student profile
router.get('/profile', (req, res) => {
  const studentId = req.headers.authorization?.split(' ')[1] || '1'; // Mock auth
  const profile = studentDB.profiles[studentId] || studentDB.profiles['1'];
  
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  
  res.json(profile);
});

// Update student profile
router.put('/profile', (req, res) => {
  const { name, bio, skills } = req.body;
  const studentId = req.headers.authorization?.split(' ')[1] || '1';
  const profile = studentDB.profiles[studentId] || studentDB.profiles['1'];

  if (name) profile.name = name;
  if (bio) profile.bio = bio;
  if (skills) profile.skills = skills;
  studentDB.profiles[studentId] = profile;
  persist();

  res.json({ message: "Profile updated", profile });
});

// Get earnings
router.get('/earnings', (req, res) => {
  const studentId = req.headers.authorization?.split(' ')[1] || '1';
  const earnings = studentDB.earnings[studentId] || studentDB.earnings['1'];
  
  if (!earnings) {
    return res.status(404).json({ error: "Earnings data not found" });
  }
  
  res.json(earnings);
});

// Update earnings (when work is approved)
router.post('/earnings/update', (req, res) => {
  const { amount, status } = req.body;
  const studentId = req.headers.authorization?.split(' ')[1] || '1';
  const earnings = studentDB.earnings[studentId] || studentDB.earnings['1'];

  if (status === 'approved') {
    earnings.available += amount * 0.9; // 10% platform fee
    earnings.inEscrow -= amount;
    earnings.totalEarned += amount;
  }
  studentDB.earnings[studentId] = earnings;
  persist();

  res.json({ message: "Earnings updated", earnings });
});

// Get my gigs
router.get('/gigs', (req, res) => {
  // Return all gigs for this student
  res.json([]);
});

module.exports = router;
