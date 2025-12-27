const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const STUDENT_FILE = path.join(__dirname, '..', 'data', 'student.json');
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

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

// Ensure profiles object exists
if (!studentDB.profiles) studentDB.profiles = {};

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

// Save/update profile by email (new POST endpoint for frontend)
router.post('/profile', (req, res) => {
  const { email, name, phone, bio, location, university, major, graduationYear, skills, hourlyRate, portfolio } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Ensure profiles object exists
  if (!studentDB.profiles) studentDB.profiles = {};
  
  // Initialize if student doesn't exist
  if (!studentDB.profiles[email]) {
    studentDB.profiles[email] = {
      email,
      name: name || '',
      phone: phone || '',
      bio: bio || '',
      location: location || '',
      university: university || '',
      major: major || '',
      graduationYear: graduationYear || '',
      skills: skills || [],
      hourlyRate: hourlyRate || '',
      portfolio: portfolio || [],
      rating: 0,
      verified: false,
      earnings: 0,
      inEscrow: 0,
      createdAt: new Date()
    };
  } else {
    // Update existing profile
    const profile = studentDB.profiles[email];
    if (name !== undefined) profile.name = name;
    if (phone !== undefined) profile.phone = phone;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;
    if (university !== undefined) profile.university = university;
    if (major !== undefined) profile.major = major;
    if (graduationYear !== undefined) profile.graduationYear = graduationYear;
    if (skills !== undefined) profile.skills = skills;
    if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
    if (portfolio !== undefined) profile.portfolio = portfolio;
  }
  
  persist();
  console.log('✅ Student profile saved:', email);
  
  // Also update users.json so name changes reflect in real-time (messages, conversations, etc.)
  try {
    const usersDB = loadJson(USERS_FILE, {});
    console.log('Loaded users.json, updating name for:', email);
    if (!usersDB[email]) {
      usersDB[email] = { email, name: name || '', role: 'student', verified: false };
      console.log('Created new user entry:', email);
    } else {
      if (name !== undefined) {
        const oldName = usersDB[email].name;
        usersDB[email].name = name;
        console.log(`Updated name: "${oldName}" → "${name}"`);
      }
    }
    saveJson(USERS_FILE, usersDB);
    console.log('✅ Successfully updated users.json for email:', email);
  } catch (err) {
    console.error('❌ Failed to update users.json:', err.message);
  }
  
  res.status(201).json({ message: 'Profile saved successfully', profile: studentDB.profiles[email] });
});

module.exports = router;
