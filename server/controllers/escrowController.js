// Mock database for transactions
let transactions = [
  { 
    id: 101, 
    studentId: 1, 
    clientId: 999, 
    amount: 50, 
    status: 'UNDER_REVIEW', 
    title: "Logo Design v1",
    gigId: 1,
    createdAt: new Date(),
    workSubmitted: new Date(),
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  }
];

let escrowVault = {}; // Track locked funds per transaction

// Create Escrow Transaction
exports.createEscrow = (req, res) => {
  const { gigId, studentId, clientId, amount, title, category } = req.body;
  
  if (!gigId || !studentId || !clientId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transaction = {
    id: Date.now(),
    gigId,
    studentId,
    clientId,
    amount,
    title: title || "Service",
    category,
    status: 'PENDING_PAYMENT',
    createdAt: new Date(),
    workSubmitted: null,
    completedAt: null,
    rating: 0,
    review: ''
  };

  transactions.push(transaction);

  res.status(201).json({ 
    message: "Escrow transaction created", 
    transaction,
    nextStep: "Client must deposit funds to lock the transaction"
  });
};

// Client Deposits Funds (Step 1: Deposit)
exports.depositFunds = (req, res) => {
  const { transactionId, amount } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'PENDING_PAYMENT') {
    return res.status(400).json({ error: "Transaction not ready for payment" });
  }

  // Lock funds in escrow
  transaction.status = 'IN_ESCROW_LOCKED';
  escrowVault[transactionId] = {
    amount,
    lockedAt: new Date(),
    releasedAt: null
  };

  res.json({ 
    message: "Funds deposited and locked in escrow vault", 
    transaction,
    escrowInfo: escrowVault[transactionId]
  });
};

// Student Submits Work (Step 2: Work Submission)
exports.submitWork = (req, res) => {
  const { transactionId, workDescription, deliverables } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'IN_ESCROW_LOCKED') {
    return res.status(400).json({ error: "Funds must be locked before submitting work" });
  }

  transaction.status = 'WORK_SUBMITTED';
  transaction.workSubmitted = new Date();
  transaction.workDescription = workDescription;
  transaction.deliverables = deliverables;

  res.json({ 
    message: "Work submitted! Waiting for client approval", 
    transaction,
    escrowStatus: "Funds remain locked until client approves"
  });
};

// Client Approves Work (Step 3: Approval)
exports.approveWork = (req, res) => {
  const { transactionId, rating, review } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'WORK_SUBMITTED') {
    return res.status(400).json({ error: "No work submitted to approve" });
  }

  // Release funds from escrow
  transaction.status = 'COMPLETED';
  transaction.completedAt = new Date();
  transaction.rating = rating || 5;
  transaction.review = review || '';

  const escrow = escrowVault[transactionId];
  if (escrow) {
    escrow.releasedAt = new Date();
  }

  res.json({ 
    message: "Work approved! Payment released to student", 
    transaction,
    studentEarnings: {
      amount: transaction.amount,
      netAfterFee: transaction.amount * 0.9, // 10% platform fee
      status: "Transferred to student wallet"
    }
  });
};

// Client Requests Revision (Step 3 Alternative: Revision)
exports.requestRevision = (req, res) => {
  const { transactionId, revisionRequest } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  transaction.status = 'REVISION_REQUESTED';
  transaction.revisionRequest = revisionRequest;

  res.json({ 
    message: "Revision requested. Funds remain locked.", 
    transaction,
    escrowStatus: "Funds still in escrow until student resubmits"
  });
};

// Resubmit after revision
exports.resubmitWork = (req, res) => {
  const { transactionId, workDescription, deliverables } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status !== 'REVISION_REQUESTED') {
    return res.status(400).json({ error: "No revision pending" });
  }

  transaction.status = 'WORK_SUBMITTED';
  transaction.workDescription = workDescription;
  transaction.deliverables = deliverables;
  transaction.revisedAt = new Date();

  res.json({ 
    message: "Revised work resubmitted", 
    transaction
  });
};

// Get Escrow Status
exports.getEscrowStatus = (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id == id);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const escrow = escrowVault[id] || {};

  res.json({
    transaction,
    escrowStatus: {
      status: transaction.status,
      amountLocked: escrow.amount || 0,
      lockedAt: escrow.lockedAt,
      releasedAt: escrow.releasedAt,
      platformFee: transaction.amount ? (transaction.amount * 0.1).toFixed(2) : 0
    }
  });
};

// Dispute Management (Admin)
exports.handleDispute = (req, res) => {
  const { transactionId, resolution } = req.body;
  const transaction = transactions.find(t => t.id == transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  transaction.status = 'DISPUTE_RESOLVED';
  transaction.disputeResolution = resolution; // 'RELEASE_TO_STUDENT' or 'REFUND_TO_CLIENT'

  res.json({ 
    message: "Dispute resolved by admin", 
    transaction,
    resolution: `Funds ${resolution === 'RELEASE_TO_STUDENT' ? 'released to student' : 'refunded to client'}`
  });
};

// List all transactions (for dashboard)
exports.getAllTransactions = (req, res) => {
  res.json(transactions);
};