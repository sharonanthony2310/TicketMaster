
import express from 'express';
import protect from '../middleware/authMiddleware.js';

import {
  addProjectMember,
  getProjectMembers,
  updateMemberRole,
  removeProjectMember
} from '../controllers/teamController.js';

const router = express.Router();

router.use(protect);

router.get('/:projectId/members', getProjectMembers);
router.post('/:projectId/members', addProjectMember);
router.put('/:projectId/members/:memberId', updateMemberRole);
router.delete('/:projectId/members/:memberId', removeProjectMember);

export default router;
