
import express from 'express';

import protect from '../middleware/authMiddleware.js';

import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// All ticket routes require authentication
router.use(protect);

// Create ticket
router.post('/', createTicket);

// Get all tickets and apply filters
router.get('/', getTickets);

// Get a specific ticket
router.get('/:id', getTicketById);

// Update ticket
router.put('/:id', updateTicket);

// Delete ticket
router.delete('/:id', deleteTicket);

export default router;
