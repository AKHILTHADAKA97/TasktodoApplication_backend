import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegisterInput,
  validateLoginInput
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
