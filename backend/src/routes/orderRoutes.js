import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/my', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
