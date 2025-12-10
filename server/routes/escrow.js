const express = require('express');
const escrowController = require('../controllers/escrowController');

const router = express.Router();

// NEW QR PAYMENT FLOW ROUTES
// 1. Client clicks "Hire Me" -> shows QR Modal
// 2. Client scans QR, pays via UPI, clicks "I Have Paid"
router.post('/create', escrowController.createEscrow);

// 3. Admin verifies payment (checks bank account)
router.post('/admin-confirm', escrowController.adminConfirmPayment);

// 4. Student submits work (after escrow funded)
router.post('/submit-work', escrowController.submitWork);

// 5. Client approves work (funds released)
router.post('/approve', escrowController.approveWork);

// Alternative: Client requests revision
router.post('/request-revision', escrowController.requestRevision);

// Get all transactions
router.get('/status', escrowController.getStatus);

// Get pending payments for admin
router.get('/pending', escrowController.getPendingPayments);

// Get single transaction
router.get('/:id', escrowController.getTransactionById);

module.exports = router;