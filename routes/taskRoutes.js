import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTaskInput } from '../validators/authValidator.js';

const router = express.Router();

router.use(protect); // Secure all task routes

router.route('/')
  .get(getTasks)
  .post(validateTaskInput, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(validateTaskInput, updateTask)
  .delete(deleteTask);

export default router;
