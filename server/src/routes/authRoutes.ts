import { Router } from 'express';
import { login, register, refreshSession } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshSession);

export default router;
