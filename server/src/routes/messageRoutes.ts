import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getMessages, createMessage } from '../controllers/messageController';

const router = Router();

router.get('/', authenticate, getMessages);
router.get('/channel/:channelId', authenticate, getMessages);
router.post('/', authenticate, createMessage);

export default router;
