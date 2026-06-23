import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { login, register, refreshSession, profile } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshSession);
router.get('/profile', authenticate, profile);

export default router;
