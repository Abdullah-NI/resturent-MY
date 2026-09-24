import asyncHandler from '../utils/asyncHandler.js';
import Review from '../models/Review.js';

// @desc    Submit or update customer review
// @route   POST /api/reviews
// @access  Private (Authenticated Users Only)
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error('Please select a valid rating between 1 and 5 stars.');
  }

  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error('Please write a review comment.');
  }

  // Check if user already submitted a review
  let review = await Review.findOne({ user: req.user._id });

  if (review) {
    review.rating = Number(rating);
    review.comment = comment.trim();
    review.name = req.user.name;
    review.isApproved = false; // Reset approval for admin re-verification
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Your review has been updated and submitted for admin approval!',
      review,
    });
  }

  review = await Review.create({
    name: req.user.name,
    rating: Number(rating),
    comment: comment.trim(),
    user: req.user._id,
    isApproved: false, // Requires admin approval
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for your review! It will be published after admin approval.',
    review,
  });
});

// @desc    Get approved public reviews with pagination & summary stats
// @route   GET /api/reviews
// @access  Public
export const getApprovedReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = req.query.limit ? Number(req.query.limit) : 0;
  const skip = (page - 1) * limit;

  const totalReviews = await Review.countDocuments({ isApproved: true });

  let query = Review.find({ isApproved: true }).sort({ createdAt: -1 });

  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }

  const reviews = await query;

  // Calculate average rating
  const allApproved = await Review.find({ isApproved: true }).select('rating');
  const avgRating = allApproved.length > 0
    ? (allApproved.reduce((acc, curr) => acc + curr.rating, 0) / allApproved.length).toFixed(1)
    : 5.0;

  res.json({
    success: true,
    count: reviews.length,
    totalReviews,
    page: limit > 0 ? page : 1,
    totalPages: limit > 0 ? Math.ceil(totalReviews / limit) : 1,
    averageRating: Number(avgRating),
    reviews,
  });
});

// @desc    Get all reviews (for Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, reviews });
});

// @desc    Approve/Reject review
// @route   PATCH /api/admin/reviews/:id
// @access  Private/Admin
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isApproved = isApproved;
  await review.save();

  res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'hidden'} successfully`, review });
});

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted successfully' });
});
