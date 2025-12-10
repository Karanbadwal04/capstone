const path = require('path');
const { loadJson, saveJson } = require('../utils/fileStore');

// File-based storage so data survives restarts and can be committed
const TRANSACTIONS_FILE = path.join(__dirname, '..', 'data', 'transactions.json');

// Mock database for transactions with NEW QR PAYMENT FLOW
let transactions = loadJson(TRANSACTIONS_FILE, []);

const persist = () => saveJson(TRANSACTIONS_FILE, transactions);

// ===== PAYMENT FLOW =====
// 1. Client clicks "Hire Me" -> QR Modal shows with Amount
// 2. Client scans QR, pays via UPI, clicks "I Have Paid"  
// 3. Transaction created: status = WAITING_ADMIN_APPROVAL
// 4. Admin checks bank, clicks "Confirm Payment"
// 5. Status = IN_ESCROW (funds locked)
// 6. Student sees "Escrow Funded" and works

// Step 1: Client initiates payment (after scanning QR and paying)
exports.createEscrow = (req, res) => {
  const { title, amount, studentId, clientId } = req.body;
  
  const transaction = {
    id: Date.now(),
    studentId: studentId || 1,
    clientId: clientId || 999,
    amount,
    title,
    status: 'WAITING_ADMIN_APPROVAL', // WAITING FOR ADMIN VERIFICATION
    createdAt: new Date(),
    qrScannedAt: new Date(),
    paymentVerifiedAt: null,
    escrowLockedAt: null
  };
  
  transactions.push(transaction);
  persist();
  
  res.status(201).json({ 
    message: "Payment proof submitted to admin",
    transaction,
    nextStep: "Admin will verify the payment within 5 minutes"
  });
};

// Step 2: Admin verifies payment (after checking bank account)
exports.adminConfirmPayment = (req, res) => {
  const { transactionId } = req.body;
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'WAITING_ADMIN_APPROVAL') {
    return res.status(400).json({ error: "Transaction not awaiting approval" });
  }

  // Admin confirmed - move to IN_ESCROW (funds locked)
  transaction.status = 'IN_ESCROW';
  transaction.paymentVerifiedAt = new Date();
  transaction.escrowLockedAt = new Date();

  persist();

  res.json({ 
    success: true,
    message: "Payment verified! Funds locked in escrow.",
    transaction,
    studentNotification: "Your escrow is funded! You can now start working."
  });
};

// Step 3: Student submits work (after escrow is funded)
exports.submitWork = (req, res) => {
  const { transactionId } = req.body;
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'IN_ESCROW') {
    return res.status(400).json({ error: "Escrow not funded yet" });
  }

  transaction.status = 'WORK_SUBMITTED';
  transaction.workSubmittedAt = new Date();

  persist();

  res.json({ 
    success: true,
    message: "Work submitted! Client reviewing...",
    transaction,
    escrowStatus: "Funds locked until client approves"
  });
};

// Step 4: Client approves work (releases funds from escrow)
exports.approveWork = (req, res) => {
  const { transactionId, rating, review } = req.body;
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'WORK_SUBMITTED') {
    return res.status(400).json({ error: "No work submitted to approve" });
  }

  // Release funds from escrow to student
  transaction.status = 'COMPLETED';
  transaction.completedAt = new Date();
  transaction.rating = rating || 5;
  transaction.review = review || '';
  transaction.fundsReleasedAt = new Date();

  persist();

  res.json({ 
    success: true,
    message: "Work approved! Funds released to student",
    transaction,
    studentEarnings: {
      amount: transaction.amount,
      netAfterFee: transaction.amount * 0.9,
      status: "Transferred to student wallet"
    }
  });
};

// Alternative: Client requests revision
exports.requestRevision = (req, res) => {
  const { transactionId, revisionMessage } = req.body;
  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  transaction.status = 'REVISION_REQUESTED';
  transaction.revisionMessage = revisionMessage;

  persist();

  res.json({ 
    success: true,
    message: "Revision requested. Funds remain locked.",
    transaction
  });
};

// Get all transactions
exports.getStatus = (req, res) => {
  res.json(transactions);
};

// Get pending payments for admin dashboard
exports.getPendingPayments = (req, res) => {
  const pending = transactions.filter(t => t.status === 'WAITING_ADMIN_APPROVAL');
  res.json(pending);
};

// Get transaction by ID
exports.getTransactionById = (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id == id);
  
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  
  res.json(transaction);
};