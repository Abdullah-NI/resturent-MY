import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reservations/my');
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">My Table Bookings</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Status of your table reservations at Sky Lounge</p>
        </div>

        <Link
          to="/reservation"
          className="px-4 py-2 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold"
        >
          Book Table
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-red-200 dark:border-red-900/40 rounded-3xl p-10 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Failed to Load Reservations</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchReservations}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <Calendar className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Reservations Found</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">You haven't reserved a table yet.</p>
          <Link
            to="/reservation"
            className="inline-block px-6 py-2.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shadow-gold"
          >
            Book a Table Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res._id}
              className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-md dark:shadow-none"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{res.name}</h3>
                    {res.phone && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">({res.phone})</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Booked on:{' '}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {res.createdAt
                        ? new Date(res.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'N/A'}
                    </span>
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    res.status === 'Confirmed'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                      : res.status === 'Rejected' || res.status === 'Cancelled'
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-500/40'
                      : 'bg-burgundy-50 dark:bg-gold-500/10 text-burgundy-800 dark:text-gold-400 border border-burgundy-200 dark:border-gold-500/40'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Calendar className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Date</span>
                    <span className="font-semibold">{res.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Time</span>
                    <span className="font-semibold">{res.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Users className="w-4 h-4 text-burgundy-800 dark:text-gold-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Guests</span>
                    <span className="font-semibold">
                      {res.numberOfGuests} {res.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                    </span>
                  </div>
                </div>
              </div>

              {res.specialRequest && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50 text-xs">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Special Request: </span>
                  <span className="text-zinc-800 dark:text-zinc-200 italic">"{res.specialRequest}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
