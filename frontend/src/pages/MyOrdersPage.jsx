import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let fetchedOrders = [];

        if (user) {
          // Logged-in user: Fetch strictly their authenticated orders from API
          const res = await api.get('/orders/my');
          if (res.data.success && Array.isArray(res.data.orders)) {
            fetchedOrders = res.data.orders;
          }
        } else {
          // Guest user: Check local storage order IDs
          const localOrderIds = JSON.parse(localStorage.getItem('skylounge_guest_orders') || '[]');
          if (Array.isArray(localOrderIds) && localOrderIds.length > 0) {
            const guestFetchPromises = localOrderIds
              .filter(Boolean)
              .map((id) => api.get(`/orders/${id}`).then((res) => res.data?.order).catch(() => null));

            const guestOrders = await Promise.all(guestFetchPromises);
            fetchedOrders = guestOrders.filter((o) => o && o._id);
          }
        }

        // Sort by creation date descending
        fetchedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?._id]);

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">My Food Orders</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">History of all orders placed with Sky Lounge</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No Orders Found</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">You haven't placed any food orders yet.</p>
          <Link
            to="/menu"
            className="inline-block px-6 py-2.5 rounded-full bg-gold-400 text-zinc-950 font-bold text-xs"
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gold-500/30 transition-all shadow-md dark:shadow-none"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-wider block">
                  Order #{ord.orderNumber || ord._id}
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Method: {ord.paymentMethod || 'COD'}</span>
                  <span>•</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    Payment: {ord.paymentStatus === 'Paid' || ord.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Total</span>
                  <span className="font-heading text-lg font-bold text-burgundy-800 dark:text-gold-400">₹{ord.total}</span>
                </div>

                <Link
                  to={`/order-tracking?id=${ord._id}`}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-burgundy-800 dark:hover:text-gold-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
