import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} from '../controllers/documentController';

const router = Router();

router.post('/', authenticate, createDocument);
router.get('/workspace/:workspaceId', authenticate, getDocuments);
router.get('/:id', authenticate, getDocument);
router.put('/:id', authenticate, updateDocument);
router.delete('/:id', authenticate, deleteDocument);

export default router;
