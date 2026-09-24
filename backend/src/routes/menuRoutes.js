import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', requireAuth, requireRole('admin'), createMenuItem);
router.put('/:id', requireAuth, requireRole('admin'), updateMenuItem);
router.delete('/:id', requireAuth, requireRole('admin'), deleteMenuItem);

export default router;
