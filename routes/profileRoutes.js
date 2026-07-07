import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Secure all profile routes

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.put('/change-password', changePassword);

export default router;
