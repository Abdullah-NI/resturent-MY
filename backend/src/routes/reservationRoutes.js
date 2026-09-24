import express from 'express';
import {
  createReservation,
  getMyReservations,
} from '../controllers/reservationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, createReservation);
router.get('/my', requireAuth, getMyReservations);

export default router;
