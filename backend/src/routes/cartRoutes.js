import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart operations require authentication
router.use(requireAuth);

router.get('/', getCart);
router.post('/', updateCart);
router.delete('/', clearCart);

export default router;
