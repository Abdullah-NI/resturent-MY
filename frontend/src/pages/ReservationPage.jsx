import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function ReservationPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    date: new Date().toISOString().split('T')[0],
    time: '07:00 PM',
    numberOfGuests: 2,
    specialRequest: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [submitting, setSubmitting] = useState(false);
  const [successReservation, setSuccessReservation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/reservations', formData);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setSuccessReservation(res.data.reservation);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit reservation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Calendar className="w-3.5 h-3.5" />
          <span>Online Table Booking</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white">
          Reserve Your Lounge Table
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Book your table at Sky Lounge Restaurant in advance for a smooth and delightful dining experience.
        </p>
      </div>

      {successReservation ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-gold-500/40 rounded-3xl p-8 text-center space-y-6 shadow-xl dark:shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-burgundy-800 dark:text-gold-400 mx-auto" />
          <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Reservation Request Submitted!</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
            We have received your table reservation request for <span className="text-burgundy-800 dark:text-gold-400 font-bold">{formData.numberOfGuests} Guests</span> on <span className="text-burgundy-800 dark:text-gold-400 font-bold">{formData.date} at {formData.time}</span>.
          </p>
          <div className="pt-2 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setSuccessReservation(null)}
              className="px-6 py-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Book Another Table
            </button>
            <Link
              to="/my-reservations"
              className="px-6 py-2.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View My Bookings</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  disabled
                  value={formData.name}
                  // onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  // placeholder="Enter full name"
                  className="w-full bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9760999444"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Time Slot</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Special Requests (Optional)</label>
              <textarea
                rows="3"
                value={formData.specialRequest}
                onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })}
                placeholder="Window seating, birthday celebration setup, etc."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 text-zinc-950 font-bold text-sm hover:brightness-110 shadow-gold transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{submitting ? 'Confirming...' : 'Confirm Table Reservation'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
