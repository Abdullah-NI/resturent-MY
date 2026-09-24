import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Clock, CheckCircle2, Truck, Utensils, MapPin, Phone, RotateCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('id') || '';
  const [inputOrderId, setInputOrderId] = useState(orderIdParam);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchOrder = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}?t=${Date.now()}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (error) {
      showToast('Order not found. Please check your order ID.', 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) {
      setInputOrderId(orderIdParam);
      fetchOrder(orderIdParam);
    }
  }, [orderIdParam]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const queryId = inputOrderId.trim();
    if (queryId) {
      setSearchParams({ id: queryId });
      fetchOrder(queryId);
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
  const currentStep = order ? statuses.indexOf(order.orderStatus) : 0;

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-50 dark:bg-gold-500/10 border border-burgundy-200 dark:border-gold-500/30 text-burgundy-800 dark:text-gold-400 text-xs font-bold uppercase tracking-widest">
          <Truck className="w-3.5 h-3.5" />
          <span>Live Delivery Tracking</span>
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white">
          Track Your Order
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Enter your unique order ID or order number below to check real-time kitchen preparation and delivery progress.
        </p>
      </div>

      {/* Search Order Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-3">
        <input
          type="text"
          required
          placeholder="Enter Order ID or Order Number..."
          value={inputOrderId}
          onChange={(e) => setInputOrderId(e.target.value)}
          className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gold-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gold-400 text-zinc-950 font-bold text-xs hover:bg-gold-300 transition-colors shrink-0 flex items-center gap-2 shadow-gold"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Locating...' : 'Track Order'}</span>
        </button>
      </form>

      {/* Order Details Display */}
      {order && (
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl dark:shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] text-burgundy-800 dark:text-gold-400 font-bold uppercase tracking-wider block">
                Order #{order.orderNumber || order._id}
              </span>
              <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">
                Status: <span className="text-burgundy-800 dark:text-gold-400">{order.orderStatus}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchOrder(inputOrderId.trim() || order.orderNumber || order._id)}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Updating...' : 'Track Order'}</span>
              </button>
              <div className="text-right text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-white">Payment ({order.paymentMethod || 'COD'}):</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}
                  >
                    {order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="py-4">
            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              {statuses.map((st, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={st} className="flex sm:flex-col items-center gap-3 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-burgundy-800 dark:bg-gold-500 text-white dark:text-zinc-950 shadow-md'
                          : 'bg-slate-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="sm:text-center">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-burgundy-800 dark:text-gold-400' : isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {st}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">Ordered Items</h3>
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-zinc-100 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  <span>
                    {it.quantity}x {it.name} {it.portion ? `(${it.portion})` : ''}
                  </span>
                  <span className="font-bold text-burgundy-800 dark:text-gold-400">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 text-sm font-bold text-zinc-900 dark:text-white">
              <span>Total Amount</span>
              <span className="font-heading text-xl text-burgundy-800 dark:text-gold-400">₹{order.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
