const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const escrowRoutes = require('./routes/escrow');
const gigsRoutes = require('./routes/gigs');
const studentRoutes = require('./routes/student');
const clientRoutes = require('./routes/client');
const ordersRoutes = require('./routes/orders');
const messagesRoutes = require('./routes/messages');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Micro-Job Server Running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Micro-Job Server Running on Port ${PORT}`);
  console.log(`🔐 Escrow System Active`);
  console.log(`👥 Student Marketplace Ready`);
});