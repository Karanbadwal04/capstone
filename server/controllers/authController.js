const jwt = require('jsonwebtoken');

// Approved university domains for student verification
const APPROVED_DOMAINS = ['lpu.in', '.edu', '.ac.in', 'university.com', 'college.com'];

const isUniversityEmail = (email) => {
  const domain = email.split('@')[1];
  return APPROVED_DOMAINS.some(d => domain && domain.toLowerCase().endsWith(d.toLowerCase()));
};

// Mock database (replace with actual DB)
let users = {};

exports.register = (req, res) => {
  const { email, password, name, role } = req.body;
  
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Student must use university email
  if (role === 'student' && !isUniversityEmail(email)) {
    return res.status(403).json({ 
      error: "Verification Failed", 
      message: "Students must use a valid university email (@edu, @ac.in, @lpu.in, etc.)" 
    });
  }

  // Check if user exists
  if (users[email]) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Create user
  users[email] = {
    email,
    password, // In production, hash this
    name,
    role,
    verified: role === 'student' ? true : false,
    createdAt: new Date(),
    profile: {
      bio: '',
      skills: [],
      rating: 0,
      earnings: 0,
      inEscrow: 0
    }
  };

  const token = jwt.sign({ 
    email, 
    role, 
    name,
    verified: role === 'student' 
  }, 'patent_secret_key', { expiresIn: '7d' });

  res.status(201).json({ 
    message: "Registration successful!", 
    token,
    user: {
      email,
      name,
      role,
      verified: role === 'student'
    }
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ 
    email: user.email, 
    role: user.role,
    name: user.name,
    verified: user.verified
  }, 'patent_secret_key', { expiresIn: '7d' });

  res.json({ 
    message: "Login successful", 
    token,
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified
    }
  });
};