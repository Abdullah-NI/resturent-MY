import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  searchUsersForAdmin,
  getUserOrderHistoryAdmin,
} from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getAllReservations, updateReservationStatus } from '../controllers/reservationController.js';
import { getAllReviews, updateReviewStatus, deleteReview } from '../controllers/reviewController.js';
import { addGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and admin role check to ALL routes in this file
router.use(requireAuth, requireRole('admin'));

// Dashboard Stats
router.get('/dashboard', getDashboardStats);



// Orders Management
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/user-orders', getUserOrderHistoryAdmin);

// Reservations Management
router.get('/reservations', getAllReservations);
router.patch('/reservations/:id/status', updateReservationStatus);

// Users Management
router.get('/users', getUsers);
router.get('/users/search', searchUsersForAdmin);
router.patch('/users/:id', updateUserStatus);

// Reviews Management
router.get('/reviews', getAllReviews);
router.patch('/reviews/:id', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

// Gallery Management
router.post('/gallery', addGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

// Image Upload Management (Cloudinary)
router.post('/upload/image', uploadSingleImage, uploadImage);
router.delete('/upload/image', deleteImage);

export default router;
