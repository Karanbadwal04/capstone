const express = require('express');
const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

const router = express.Router();

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

// Load persisted orders (or seed a default order)
let orders = loadJson(ORDERS_FILE, [
  {
    id: 1001,
    gigId: 1,
    studentId: 1,
    clientId: 2,
    gigTitle: "Logo Design",
    studentName: "Raj Kumar",
    clientName: "Alex Johnson",
    amount: 50,
    status: "in_progress",
    createdAt: new Date('2024-12-05'),
    dueDate: new Date('2024-12-08'),
    messages: [],
    deliverables: null,
    rating: 0,
    review: ""
  }
]);

const persist = () => saveJson(ORDERS_FILE, orders);

// Create order
router.post('/create', (req, res) => {
  const { gigId, studentId, clientId, amount, gigTitle } = req.body;

  if (!gigId || !studentId || !clientId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const order = {
    id: Date.now(),
    gigId,
    studentId,
    clientId,
    gigTitle,
    amount,
    status: 'deposit_pending', // Client needs to deposit funds
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    messages: [],
    deliverables: null,
    rating: 0,
    review: ""
  };

  orders.push(order);
  persist();
  res.status(201).json({ message: "Order created. Proceed to payment.", order });
});

// Get orders for student
router.get('/student/:studentId', (req, res) => {
  const studentOrders = orders.filter(o => o.studentId == req.params.studentId);
  res.json(studentOrders);
});

// Get orders for client
router.get('/client/:clientId', (req, res) => {
  const clientOrders = orders.filter(o => o.clientId == req.params.clientId);
  res.json(clientOrders);
});

// Get single order
router.get('/:orderId', (req, res) => {
  const order = orders.find(o => o.id == req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

// Update order status
router.put('/:orderId/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const validStatuses = ['deposit_pending', 'in_escrow', 'in_progress', 'submitted_for_review', 'completed', 'disputed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  order.status = status;
  persist();
  res.json({ message: "Order status updated", order });
});

// Student starts work
router.post('/:orderId/start-work', (req, res) => {
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = 'in_progress';
  order.startedAt = new Date();

  persist();
  res.json({ message: "Work started", order });
});

// Student submits work
router.post('/:orderId/submit-work', (req, res) => {
  const { deliverables, notes } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.status !== 'in_progress' && order.status !== 'revision_requested') {
    return res.status(400).json({ error: "Order not in correct status" });
  }

  order.status = 'submitted_for_review';
  order.deliverables = deliverables;
  order.submittedAt = new Date();
  order.submissionNotes = notes;

  persist();
  res.json({ message: "Work submitted for review", order });
});

// Client approves work
router.post('/:orderId/approve', (req, res) => {
  const { rating, review } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (order.status !== 'submitted_for_review') {
    return res.status(400).json({ error: "Work not pending review" });
  }

  order.status = 'completed';
  order.completedAt = new Date();
  order.rating = rating || 5;
  order.review = review || '';

  persist();

  res.json({ 
    message: "Work approved! Payment released to student", 
    order,
    platformFee: (order.amount * 0.1).toFixed(2),
    studentEarnings: (order.amount * 0.9).toFixed(2)
  });
});

// Client requests revision
router.post('/:orderId/request-revision', (req, res) => {
  const { revisionRequest } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = 'revision_requested';
  order.revisionRequest = revisionRequest;

  persist();
  res.json({ message: "Revision requested. Funds remain locked.", order });
});

// Add message to order
router.post('/:orderId/message', (req, res) => {
  const { userId, message, senderType } = req.body;
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.messages.push({
    id: Date.now(),
    userId,
    senderType, // 'student' or 'client'
    message,
    timestamp: new Date()
  });

  persist();
  res.json({ message: "Message added", order });
});

// Get messages for order
router.get('/:orderId/messages', (req, res) => {
  const order = orders.find(o => o.id == req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order.messages);
});

module.exports = router;
