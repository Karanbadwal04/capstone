const express = require('express');
const escrowController = require('../controllers/escrowController');

const router = express.Router();

// Create escrow transaction
router.post('/create', escrowController.createEscrow);

// Client deposits funds (locks them)
router.post('/deposit', escrowController.depositFunds);

// Student submits work
router.post('/submit-work', escrowController.submitWork);

// Client approves work (releases payment)
router.post('/approve', escrowController.approveWork);

// Client requests revision
router.post('/request-revision', escrowController.requestRevision);

// Student resubmits after revision
router.post('/resubmit-work', escrowController.resubmitWork);

// Get status
router.get('/status/:id', escrowController.getEscrowStatus);

// Admin handles disputes
router.post('/resolve-dispute', escrowController.handleDispute);

// List all
router.get('/all', escrowController.getAllTransactions);

module.exports = router;