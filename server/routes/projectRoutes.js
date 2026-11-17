
import express from 'express';

import protect from '../middleware/authMiddleware.js';

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Create project
router.post('/', createProject);

// Get all projects
router.get('/', getProjects);

// Get one project
router.get('/:id', getProjectById);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

export default router;
