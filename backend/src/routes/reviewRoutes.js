import express from 'express';
import {
  createReview,
  getApprovedReviews,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getApprovedReviews);
router.post('/', requireAuth, createReview);

export default router;
