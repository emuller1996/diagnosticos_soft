import express from 'express';
import projectController from '../controllers/projectController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post('/', projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/stats', projectController.getStats);
router.get('/:projectId', projectController.getProjectById);
router.put('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.inactivateProject);

export default router;