import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  joinWorkspace,
  leaveWorkspace
} from '../controllers/workspaceController';

const router = Router();

router.post('/', authenticate, createWorkspace);
router.get('/', authenticate, getWorkspaces);
router.get('/:id', authenticate, getWorkspace);
router.put('/:id', authenticate, updateWorkspace);
router.delete('/:id', authenticate, deleteWorkspace);
router.post('/join', authenticate, joinWorkspace);
router.post('/:id/leave', authenticate, leaveWorkspace);

export default router;
