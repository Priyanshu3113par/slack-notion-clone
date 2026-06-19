import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createChannel,
  getChannels,
  getChannel,
  updateChannel,
  deleteChannel
} from '../controllers/channelController';

const router = Router();

router.post('/', authenticate, createChannel);
router.get('/workspace/:workspaceId', authenticate, getChannels);
router.get('/:id', authenticate, getChannel);
router.put('/:id', authenticate, updateChannel);
router.delete('/:id', authenticate, deleteChannel);

export default router;
