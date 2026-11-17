
import express from 'express';
import protect from '../middleware/authMiddleware.js';

import {
  getComments,
  addComment
} from '../controllers/commentController.js';

const router = express.Router();

router.use(protect);

router.get('/:ticketId', getComments);
router.post('/:ticketId', addComment);

export default router;
