import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) setOrder(res.data.order);
      } catch (err) {
        showToast('Order not found', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Loading order details...</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-heading text-3xl font-bold text-zinc-900 dark:text-white">Order Details</h1>
          <p className="text-xs text-burgundy-800 dark:text-gold-400 font-mono font-bold">Order ID: #{order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Customer & Address</h3>
          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <p><strong className="text-zinc-900 dark:text-white">Name:</strong> {order.customerName}</p>
            <p><strong className="text-zinc-900 dark:text-white">Phone:</strong> {order.phone}</p>
            <p><strong className="text-zinc-900 dark:text-white">Delivery Address:</strong> {order.address.street}, {order.address.city}, {order.address.pincode}</p>
            <p><strong className="text-zinc-900 dark:text-white">Payment Method:</strong> {order.paymentMethod || 'COD'}</p>
            <p className="flex items-center gap-2">
              <strong className="text-zinc-900 dark:text-white">Payment Status:</strong>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}
              >
                {order.paymentStatus === 'Paid' || order.paymentStatus === 'Completed' ? 'Paid' : 'Pending'}
              </span>
            </p>
            <p><strong className="text-zinc-900 dark:text-white">Notes:</strong> {order.notes || 'None'}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">Items Summary</h3>
          <div className="space-y-2 text-xs">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-zinc-700 dark:text-zinc-300">
                <span>{it.quantity}x {it.name} {it.portion ? `(${it.portion})` : ''}</span>
                <span className="font-bold text-burgundy-800 dark:text-gold-400">₹{it.price * it.quantity}</span>
              </div>
            ))}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between font-bold text-sm text-zinc-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-burgundy-800 dark:text-gold-400 font-heading text-lg">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
