import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ ${filePath}`);
};

console.log("🚀 Setting up UniGigs Marketplace...\n");

// ============================================
// 1. ROOT CONFIG FILES
// ============================================
console.log("📝 Creating root configs...");

writeFile('package.json', JSON.stringify({
  name: "student-marketplace",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build",
    lint: "eslint .",
    preview: "vite preview",
    "server": "cd server && node index.js"
  },
  dependencies: {
    clsx: "^2.1.1",
    lucide: "^0.378.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.23.0",
    "tailwind-merge": "^2.3.0"
  },
  devDependencies: {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    autoprefixer: "^10.4.19",
    eslint: "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    postcss: "^8.4.38",
    tailwindcss: "^3.4.3",
    vite: "^5.2.0"
  }
}, null, 2));

writeFile('vite.config.js', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`);

writeFile('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#050505',
          card: '#121212',
          orange: '#FF5500',
          glow: '#FF8800',
          text: '#FFFFFF',
          muted: '#A1A1AA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #FF5500 0%, #FF8800 100%)',
        'hero-glow': 'radial-gradient(circle at center, rgba(255, 85, 0, 0.15) 0%, rgba(5, 5, 5, 0) 70%)',
      }
    },
  },
  plugins: [],
}`);

writeFile('postcss.config.js', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

// ============================================
// 2. HTML & REACT ENTRY POINTS
// ============================================
console.log("📄 Creating HTML & React entry points...");

writeFile('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UniGigs - Student Marketplace</title>
  </head>
  <body class="bg-[#050505] text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"><\/script>
  </body>
</html>`);

writeFile('src/main.jsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

writeFile('src/index.css', `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Poppins:wght@500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-brand-dark text-brand-text font-sans antialiased;
}

h1, h2, h3, h4 {
  @apply font-display;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-brand-dark;
}

::-webkit-scrollbar-thumb {
  @apply bg-brand-card rounded-full;
}`);

// ============================================
// 3. BACKEND SERVER
// ============================================
console.log("🖥️  Creating backend server...");

writeFile('server/index.js', `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const escrowRoutes = require('./routes/escrow');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);

app.listen(PORT, () => console.log(\`✅ Server Running on Port \${PORT}\`));`);

// ============================================
// 4. BACKEND ROUTES
// ============================================
console.log("🛣️  Creating routes...");

writeFile('server/routes/auth.js', `const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;`);

writeFile('server/routes/escrow.js', `const express = require('express');
const escrowController = require('../controllers/escrowController');

const router = express.Router();

router.post('/create', escrowController.createEscrow);
router.get('/status/:id', escrowController.getEscrowStatus);
router.post('/release/:id', escrowController.releasePayment);

module.exports = router;`);

// ============================================
// 5. BACKEND CONTROLLERS
// ============================================
console.log("🎮 Creating controllers...");

writeFile('server/controllers/authController.js', `const jwt = require('jsonwebtoken');

const isUniversityEmail = (email) => {
  const approvedDomains = ['lpu.in', 'edu', 'ac.in', 'university.com'];
  const domain = email.split('@')[1];
  return approvedDomains.some(d => domain && domain.endsWith(d));
};

exports.register = (req, res) => {
  const { email, role } = req.body;
  
  if (role === 'student' && !isUniversityEmail(email)) {
    return res.status(403).json({ 
      error: "Verification Failed", 
      message: "Must use .edu or .ac.in email." 
    });
  }
  
  const token = jwt.sign({ email, role, verified: true }, 'patent_secret');
  res.status(201).json({ message: "Identity Verified", token });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  
  const token = jwt.sign({ email }, 'patent_secret');
  res.json({ message: "Login successful", token });
};`);

writeFile('server/controllers/escrowController.js', `let transactions = [
  { id: 101, studentId: 1, clientId: 999, amount: 50, status: 'UNDER_REVIEW', title: "Logo Design v1" }
];

exports.createEscrow = (req, res) => {
  const { studentId, clientId, amount, title } = req.body;
  
  if (!studentId || !clientId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const transaction = {
    id: Date.now(),
    studentId,
    clientId,
    amount,
    title: title || "Service",
    status: 'PENDING_VERIFICATION',
    createdAt: new Date()
  };
  
  transactions.push(transaction);
  res.status(201).json({ message: "Escrow created", transaction });
};

exports.getEscrowStatus = (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id == id);
  
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  
  res.json(transaction);
};

exports.releasePayment = (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id == id);
  
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  
  transaction.status = 'RELEASED';
  res.json({ message: "Payment released", transaction });
};`);

// ============================================
// 6. FRONTEND PAGES
// ============================================
console.log("📱 Creating frontend pages...");

writeFile('src/pages/Home.jsx', `export default function Home() {
  return (
    <div className="min-h-screen bg-brand-dark">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-white mb-4">UniGigs</h1>
        <p className="text-brand-muted text-lg">Your Student Marketplace</p>
      </div>
    </div>
  );
}`);

writeFile('src/pages/Dashboard.jsx', `export default function Dashboard() {
  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>
      <p className="text-brand-muted">Welcome to your dashboard</p>
    </div>
  );
}`);

writeFile('src/pages/Profile.jsx', `export default function Profile() {
  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Profile</h2>
      <p className="text-brand-muted">Your profile information</p>
    </div>
  );
}`);

writeFile('src/pages/CreateListing.jsx', `export default function CreateListing() {
  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Create Listing</h2>
      <form className="max-w-2xl">
        <p className="text-brand-muted">Create your listing here</p>
      </form>
    </div>
  );
}`);

// ============================================
// 7. FRONTEND COMPONENTS
// ============================================
console.log("🧩 Creating components...");

writeFile('src/components/Navbar.jsx', `import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-brand-card border-b border-brand-orange">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-brand-orange">UniGigs</Link>
        <div className="hidden md:flex gap-6">
          <Link to="/" className="text-brand-text hover:text-brand-orange">Home</Link>
          <Link to="/dashboard" className="text-brand-text hover:text-brand-orange">Dashboard</Link>
          <Link to="/profile" className="text-brand-text hover:text-brand-orange">Profile</Link>
        </div>
        <Menu className="md:hidden text-brand-text" />
      </div>
    </nav>
  );
}`);

writeFile('src/components/ListingCard.jsx', 'export default function ListingCard({ title, price, image }) {\n  return (\n    <div className="bg-brand-card rounded-lg overflow-hidden hover:border-brand-orange border-2 border-transparent transition">\n      {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}\n      <div className="p-4">\n        <h3 className="text-white font-semibold">{title}</h3>\n        <p className="text-brand-orange font-bold text-lg">${price}</p>\n      </div>\n    </div>\n  );\n}');

// ============================================
// 8. FRONTEND UTILS & HOOKS
// ============================================
console.log("🔧 Creating utilities...");

writeFile('src/data/mockData.js', `export const mockListings = [
  { id: 1, title: "Web Design", price: 50, category: "Design" },
  { id: 2, title: "Content Writing", price: 25, category: "Writing" },
  { id: 3, title: "Video Editing", price: 75, category: "Video" }
];

export const mockUsers = [
  { id: 1, name: "Raj", role: "student", email: "raj@lpu.in" },
  { id: 2, name: "Priya", role: "client", email: "priya@company.com" }
];`);

writeFile('src/hooks/useEscrow.jsx', `import { useState } from 'react';

export const useEscrow = () => {
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(false);

  const createEscrow = async (data) => {
    setLoading(true);
    try {
      const res = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      setEscrow(result.transaction);
      return result;
    } catch (error) {
      console.error('Escrow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { escrow, loading, createEscrow };
};`);

// ============================================
// 9. MAIN APP COMPONENT
// ============================================
console.log("🎨 Creating App.jsx...");

writeFile('src/App.jsx', `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create" element={<CreateListing />} />
      </Routes>
    </Router>
  );
}`);

console.log("\n✨ Setup Complete! Your project is organized.");
console.log("\nNext steps:");
console.log("1. npm install");
console.log("2. npm run dev");
console.log("3. cd server && npm install && node index.js");
