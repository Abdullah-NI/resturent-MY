import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      if (res.data.success) setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id, currentApproved) => {
    try {
      const res = await api.patch(`/admin/reviews/${id}`, { isApproved: !currentApproved });
      if (res.data.success) {
        showToast(`Review ${!currentApproved ? 'approved' : 'hidden'}`, 'success');
        fetchReviews();
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this review permanently?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        showToast('Review deleted', 'info');
        fetchReviews();
      } catch (err) {
        showToast('Delete failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Customer Reviews Moderation</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Approve or reject customer feedback before public display</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-8">Loading reviews...</div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white text-xs">{r.name}</span>
                    <div className="flex text-gold-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-gold-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">"{r.comment}"</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(r._id, r.isApproved)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      r.isApproved
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 border border-burgundy-200 dark:border-gold-500/40 hover:bg-gold-500 hover:text-zinc-950'
                    }`}
                  >
                    {r.isApproved ? 'Approved' : 'Approve'}
                  </button>

                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
