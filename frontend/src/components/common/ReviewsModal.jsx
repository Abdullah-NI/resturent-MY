import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Send, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ReviewsModal({ isOpen, onClose, onReviewSubmitted }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'write'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews?page=${p}&limit=6`);
      if (res.data.success) {
        setReviews(res.data.reviews);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotalReviews(res.data.totalReviews);
        setAverageRating(res.data.averageRating);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews(1);
    }
  }, [isOpen]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please log in to submit a review.', 'info');
      onClose();
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      showToast('Please write a comment for your review.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { rating, comment });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setComment('');
        setActiveTab('list');
        fetchReviews(1);
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Customer Reviews</h2>
                <span className="bg-amber-100 dark:bg-gold-500/10 text-amber-800 dark:text-gold-400 border border-amber-300 dark:border-gold-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-gold-400" />
                  {averageRating} / 5.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {totalReviews} verified guest feedback entries for Sky Lounge
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-colors shadow-sm"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 pt-3">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 text-xs font-bold transition-all relative px-2 ${
                activeTab === 'list'
                  ? 'text-burgundy-800 dark:text-gold-400 border-b-2 border-burgundy-800 dark:border-gold-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Reviews ({totalReviews})
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please log in to write a review.', 'info');
                  onClose();
                  navigate('/login');
                } else {
                  setActiveTab('write');
                }
              }}
              className={`pb-3 text-xs font-bold transition-all relative px-4 flex items-center gap-1.5 ${
                activeTab === 'write'
                  ? 'text-burgundy-800 dark:text-gold-400 border-b-2 border-burgundy-800 dark:border-gold-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-gold-500" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'list' ? (
              loading ? (
                <div className="space-y-4 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">No Approved Reviews Yet</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Be the first guest to share your dining experience!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-sm hover:border-gold-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-burgundy-100 dark:bg-gold-500/20 text-burgundy-800 dark:text-gold-400 font-bold flex items-center justify-center text-xs">
                            {rev.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white text-xs">{rev.name}</h4>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-gold-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-gold-500/30">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < rev.rating
                                  ? 'text-amber-500 fill-amber-500 dark:text-gold-400 dark:fill-gold-400'
                                  : 'text-zinc-300 dark:text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* WRITE A REVIEW FORM */
              <div className="space-y-6 max-w-xl mx-auto py-2">
                <div className="text-center space-y-1">
                  <h3 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">Share Your Dining Experience</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Posting as <strong className="text-burgundy-800 dark:text-gold-400">{user?.name}</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Rating Star Selector */}
                  <div className="space-y-2 text-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Select Rating</label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform transform hover:scale-125"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-500 fill-amber-500 dark:text-gold-400 dark:fill-gold-400'
                                : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-burgundy-800 dark:text-gold-400 block">
                      {rating === 5 && 'Outstanding! ⭐⭐⭐⭐⭐'}
                      {rating === 4 && 'Very Good! ⭐⭐⭐⭐'}
                      {rating === 3 && 'Average ⭐⭐⭐'}
                      {rating === 2 && 'Below Expectations ⭐⭐'}
                      {rating === 1 && 'Poor ⭐'}
                    </span>
                  </div>

                  {/* Comment input */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Your Feedback / Review</label>
                    <textarea
                      rows="4"
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about the food quality, ambience, and service at Sky Lounge..."
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 resize-none"
                    />
                  </div>

                  {/* <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-gold-500/10 border border-amber-200 dark:border-gold-500/30 text-[11px] text-amber-900 dark:text-gold-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-gold-500" />
                    <span>Thank you for your feedback.</span>
                  </div> */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-xs hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Review...' : 'Submit Review '}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer Pagination Controls */}
          {activeTab === 'list' && totalPages > 1 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between text-xs">
              <button
                disabled={page <= 1 || loading}
                onClick={() => fetchReviews(page - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-white dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages || loading}
                onClick={() => fetchReviews(page + 1)}
                className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 hover:bg-white dark:hover:bg-zinc-900 transition-colors flex items-center gap-1 font-semibold"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
