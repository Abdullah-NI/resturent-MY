import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ManageReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reservations');
      if (res.data.success) setReservations(res.data.reservations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.patch(`/admin/reservations/${id}/status`, { status });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchReservations();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Manage Table Reservations</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Review and confirm table bookings</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-8">Loading reservations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
              <thead className="bg-slate-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Special Request</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">{res.name}</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400">{res.phone}</td>
                    <td className="p-3 text-burgundy-800 dark:text-gold-400 font-semibold">{res.date} ({res.time})</td>
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">{res.numberOfGuests} Guests</td>
                    <td className="p-3 text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{res.specialRequest || '—'}</td>
                    <td className="p-3">
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusChange(res._id, e.target.value)}
                        className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
